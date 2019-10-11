'use strict';

const genericPool = require('generic-pool');
const Promise = require('bluebird');
const redis = require('redis');
const KeyKey = Symbol.for('key');
const KeyValue = Symbol.for('value');
const KeyIndex = Symbol.for('dbIndex');
let config = require('../src/config').NodeJsRedisConfig;
Promise.promisifyAll(redis.RedisClient.prototype);

const _release = Symbol('_release');
const _invalidParamsError = Symbol('_invalidParamsError');
const _validParams = Symbol('_validParams');
const _getClient = Symbol('_getClient');

/**
 * Class Redis
 * 
 */

class RedisPool {

  constructor({
    port,
    host,
    redisSecret,
    defaultDBIndex
  }) {
    let create = () => {
      return new Promise(resolve => {
        let client = redis.createClient(port, host, {
          retry_strategy: (options) => {
            return Math.min(options.attempt * 100, 3000);
          }
        });
        if (redisSecret) client.auth(redisSecret);
        client.on('connect', () => resolve(client));
      });
    };
    let destroy = client => {
      return new Promise(resolve => {
        client.on('end', () => resolve());
        client.end(true);
      });
    };
    let opts = {
      max: 50,
      min: 2,
      idleTimeoutMillis: 30000,
      log: false,
    };

    this.pool = genericPool.createPool({
      create: create,
      destroy: destroy
    }, opts);
    this.defaultDBIndex = defaultDBIndex;
  }

  /**
   * Get a new instance of redis pool by passing
   * parameters for a redis connection
   *
   * @param {Object} [param]
   * @param {Number} param.port Redis key
   * @param {String} param.host Redis url
   * @param {String} param.redisSecret Redis secret
   * @param {String} param.defaultDBIndex define a default db index for redis
   *
   * @return {RedisWrapperInstance}
   *
   * @error {Error} Customized error of 'Invalid param defaultDBIndex'
   */
  static connect({
    port = config.port,
    host = config.host,
    redisSecret = config.redisSecret,
    defaultDBIndex = 3
  } = config) {
    // param validation: defaultDBIndex
    if (defaultDBIndex !== undefined) {
      let notNumber = typeof defaultDBIndex !== 'number';
      let notInteger = !Number.isInteger(defaultDBIndex);
      let lessThanZero = defaultDBIndex < 0;
      if (notNumber || notInteger || lessThanZero)
        throw new Error('Invalid param defaultDBIndex');
    }

    return new this({
      port: port,
      host: host,
      redisSecret: redisSecret,
      defaultDBIndex
    });
  }

  /**
   * release client
   * @desc private method
   *
   * @param {Object} client Redis client
   * @return {Promise}
   */
  [_release](client) {
    return this.pool.release(client);
  }

  /**
   * get redis client
   *
   * @param {Number} dbIndex Redis db index
   *
   * @return {Promise}
   */
  [_getClient](dbIndex) {
    if (typeof dbIndex !== 'number' || !Number.isInteger(dbIndex))
      return Promise.reject(this[_invalidParamsError](new Map([
        [Symbol.keyFor(KeyIndex), dbIndex]
      ])));
    // replace original promise with bluebird
    // as finally() settler would server more
    // convinience in unit test
    return Promise.resolve(true).then(() =>
      this.pool.acquire().then(client =>
        client.selectAsync(dbIndex).then(() => client)));
  }

  /**
   * parameters validation error wrapper
   * @desc Redis parameters validation error wrapper
   *
   * @param {Map} paramsMap Map of param name and param value
   *
   * @return {Object}
   */
  [_invalidParamsError](paramsMap) {
    let message = 'Invalid params: ';
    for (let kv of paramsMap) {
      message += `${kv[0]}=>${kv[1]} `;
    }
    return {
      error: 'Invalid redis params',
      message: message
    };
  }

  /**
   * parameters validator
   *
   * @param {Map} paramsMap A map contains key or value symbol
   *
   * @return {Promise}
   */
  [_validParams](paramsMap) {
    let validParam = symbol => {
      return () => {
        return new Promise((resolve, reject) => {
          if (paramsMap.has(symbol)) {
            let mapValue = paramsMap.get(symbol);
            if (mapValue === undefined) {
              reject(this[_invalidParamsError](
                new Map([
                  [Symbol.keyFor(symbol), mapValue]
                ])
              ));
            }
          }
          resolve(true);
        });
      };
    };

    let validKey = validParam(KeyKey);
    let validValue = validParam(KeyValue);
    let validIndex = validParam(KeyIndex);

    return validKey()
      .then(validValue)
      .then(validIndex);
  }

  /**
   * GetKeyAndTtl
   * @desc wrapper of redis get and ttl
   *
   * @param {Object} obj
   * @param {String} obj.key Redis key
   * @param {Number} [obj.dbIndex]
   *
   * @return {Object} result
   * @return {String} result.value
   * @return {Number} result.ttl
   */
  getKeyAndTtl({
    key,
    dbIndex = this.defaultDBIndex
  }) {
    let validParams = () => this[_validParams](new Map([
      [KeyKey, key],
      [KeyIndex, dbIndex]
    ]));
    let getClient = () => this[_getClient](dbIndex);
    let doRedisGet = cli => {
      let redisGet = cli => cli.getAsync(key);
      let redisTtl = cli => cli.ttlAsync(key);
      return Promise.props({
        value: redisGet(cli),
        ttl: redisTtl(cli)
      }).then(obj =>
        this[_release](cli).then(() => obj));
    };

    return validParams()
      .then(getClient)
      .then(doRedisGet);
  }

  /**
   * PutValue
   * @desc implements redis put with parameters validator
   *
   * @param {Object} obj
   * @param {String} obj.key Redis key
   * @param {String} obj.value Redis value
   * @param {Number} [obj.seconds] set expired time in seconds
   * @param {Number} [obj.dbIndex]
   *
   * @return {String} same simple string replay as redis does
   *
   * @error {ParametersValidationError} error
   * @error {String}                    error.error
   * @error {String}                    error.message
   *
   * @error {RedisInternalError} error
   */
  putValue({
    key,
    value,
    seconds,
    dbIndex = this.defaultDBIndex
  } = {}) {
    let validParams = () => this[_validParams](new Map([
      [KeyKey, key],
      [KeyValue, value]
    ]));
    let getClient = () => this[_getClient](dbIndex);
    let doRedisSet = cli => {
      return cli.setAsync(key, value).then(str => {
        if (seconds !== undefined)
          return cli.expireAsync(key, seconds).then(() => str);
        return str;
      }).then(str => this[_release](cli).then(() => str));
    };

    return validParams()
      .then(getClient)
      .then(doRedisSet);
  }

  /**
   * DelByKey
   * @desc Redis del command
   *
   * @param {Object} param
   * @param {String} param.key Redis key
   * @param {Number} param.dbIndex
   *
   * @return {Number} the number of keys that were removed
   */
  delKey({
    key,
    dbIndex = this.defaultDBIndex
  }) {
    let validParams = () => this[_validParams](new Map([
      [KeyKey, key]
    ]));
    let getClient = () => this[_getClient](dbIndex);
    let doRedisDel = cli =>
      cli.delAsync(key).then(num =>
        this[_release](cli).then(() => num));

    return validParams()
      .then(getClient)
      .then(doRedisDel);
  }

  /**
   * FlushDB
   * @desc Redis flush
   *
   * @param {Number} [dbIndex] define which db to flush
   *
   * @return {String} same simple string replay as redis does
   */
  flushDB(dbIndex = this.defaultDBIndex) {
    let getClient = () => this[_getClient](dbIndex);
    let doRedisFlushDB = cli =>
      cli.flushdbAsync().then(str =>
        this[_release](cli).then(() => str));

    return getClient()
      .then(doRedisFlushDB);
  }

  /**
   * getTTL
   * @desc Redisl ttl, get remaining time to live of a key
   * that has a timeout in seconds
   *
   * @param {Object} param
   * @param {String} param.key Redis key
   * @param {Number} param.dbIndex
   *
   * @return {Number} ttl in seconds or negative value in
   *                  order to signal an error
   */
  getTtl({
    key,
    dbIndex = this.defaultDBIndex
  }) {
    let validParams = () => this[_validParams](new Map([
      [KeyKey, key]
    ]));
    let getClient = () => this[_getClient](dbIndex);
    let doRedisTtl = cli => cli.ttlAsync(key).then(expireIn =>
      this[_release](cli).then(() => expireIn));

    return validParams()
      .then(getClient)
      .then(doRedisTtl);
  }

  /**
   * listPush
   * @desc Redis lpush, insert a value at the head of
   * the list stored at key
   *
   * @param {Object} param
   * @param {String} param.key      Redis key
   * @param {String} param.value    Redis value
   * @param {Number} [param.seconds]  set expired time in seconds, optional
   * @param {Number} param.dbIndex
   *
   * @return {Number} the length of the list after the push operations
   */
  listPush({
    key,
    value,
    seconds,
    dbIndex = this.defaultDBIndex
  }) {
    let validParams = () => this[_validParams](new Map([
      [KeyKey, key],
      [KeyValue, value]
    ]));
    let getClient = () => this[_getClient](dbIndex);
    let doRedisLpush = cli =>
      cli.lpushAsync(key, value).then(length =>
        ({
          reply: length,
          client: cli
        }));
    let doRedisExpire = ({
      reply,
      client
    }) => {
      if (seconds || seconds === 0) {
        return client.expireAsync(key, seconds).then(() =>
          this[_release](client).then(() => reply));
      } else {
        return this[_release](client).then(() => reply);
      }
    };

    return validParams()
      .then(getClient)
      .then(doRedisLpush)
      .then(doRedisExpire);
  }

  /**
   * listAll
   * @desc wrapper of Redis lrange, return all elements of a list
   *
   * @param {Object} param
   * @param {String} param.key Redis key
   * @param {Number} param.dbIndex
   *
   * @return {Array} all elements of the list,
   *                 or an emplty array if key doesn't exists
   */
  listAll({
    key,
    dbIndex = this.defaultDBIndex
  }) {
    let validParams = () => this[_validParams](new Map([
      [KeyKey, key]
    ]));
    let getClient = () => this[_getClient](dbIndex);
    let doLRange = cli =>
      cli.lrangeAsync(key, 0, -1).then(arr =>
        this[_release](cli).then(() => arr));

    return validParams()
      .then(getClient)
      .then(doLRange);
  }

  /**
   * Expand method of Redis
   *
   * @param {Object} param
   * @param {String} cmd Redis command
   * @param {Array} argv Parameters of a redis command
   * @param {Number} dbIndex
   *
   * @example redis.exec({cmd: 'put', argv: ['foo', 'bar'], dbIndex: 0}).then...
   *
   * @return the very same reply from Redis server or error
   */
  exec({
    cmd,
    argv,
    dbIndex = this.defaultDBIndex
  }) {
    let getClient = () => this[_getClient](dbIndex);
    let exec = cli => {
      return cli[cmd + 'Async'].apply(cli, argv).then(data => {
        return this[_release](cli).then(() => data);
      });
    };

    return getClient().then(exec);
  }

  /**
   * Export Redis Multi
   * 
   * @param {[[String]]} cmds - [[cmd], [cmd], ...] , cmd shall be [string, string, ...]
   * @param {Number} dbIndex
   * 
   * @example 
   * redis.multi([
   *  ['set', 'foo', 'bar'],
   *  ['ttl', 'foo']
   * ])
   * 
   * @return same data as redis-cli returns
   */
  multi({
    cmds,
    dbIndex = this.defaultDBIndex
  }) {
    if (!Array.isArray(cmds) || cmds.length < 1 || !Array.isArray(cmds[0])) {
      throw new Error('Invalid Parameter: cmds');
    }
    let getClient = () => this[_getClient](dbIndex);
    let multi = cli => {
      return new Promise((resolve, reject) => {
        cli.multi(cmds).exec((err, data) => {
          if (err) reject(err);
          resolve(this[_release](cli).then(() => data));
        });
      });

    };
    return getClient().then(multi);
  }

}

exports = module.exports = RedisPool;