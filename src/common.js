
const config = require('./config');
const mysql = require('../lib/mysql');
const redis = require('../lib/redis');

let common = {
    MSQLInstance: mysql.connect(config.MYSQL),
    RedisInstance: redis.connect(config.NodeJsRedisConfig),

}


module.exports =  common;