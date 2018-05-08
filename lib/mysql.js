/**
 * Created by Jerson on 2017/6/8.
 */
'use strict';
const Promise = require('bluebird');
const mysql = require('mysql');
Promise.promisifyAll(mysql);
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);
const using = Promise.using;

class Pool{
  constructor({host, port, user, password, database, connectionLimit}){
    /**
     * 创建连接池
     * @param host              数据库地址
     * @param port              端口
     * @param user              用户名
     * @param password          密码
     * @param database          数据库
     * @param connectionLimit   连接数
     */
    this.pool = mysql.createPool({
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
      connectionLimit: connectionLimit
    });
  }
  static connect(config){
    return new this(config);
  }

  /**
   * 获取mysql连接
   * @returns {*}
   */
  getConnection() {
    return this.pool.getConnectionAsync().disposer(function (connection) {
      return connection.release();
    });
  }

  /**
   * 获取拥有transaction的mysql连接
   * @returns {*}
   */
  getTransaction() {
    return this.pool.getConnectionAsync().then(function (connection) {
      return connection.beginTransactionAsync().then(function () {
        return connection;
      });
    });
  }

  /**
   * 操作数据
   * @param sql
   * @param values
   *         如果是select，update,delete操作，values是个数组，数组元素的顺序跟sql中？匹配的顺序一致，比如：
   *                 let sql = 'select * from cc_user where guid = ? and status = ?';
   *                 let values = ['ee5d267c01eb81e77c17f58b44fa988c',1]
   *                 匹配的sql就是：select * from cc_user where guid = 'ee5d267c01eb81e77c17f58b44fa988c' and status = 1
   *        如果是insert操作，values是个JSON对象，JSON的key跟表中字段名一致。不然无法匹配，比如：
   *                 let sql = 'insert into cc_user set ?'
   *                 let values = {'guid':'ee5d267c01eb81e77c17f58b44fa988c','status':1}
   *                 匹配的sql就是： insert into cc_user(guid,status) values ('ee5d267c01eb81e77c17f58b44fa988c',1)
   * @returns {*}
   */
  query(sql, values){
    return using(this.getConnection(), (connection) =>{
      return connection.queryAsync({sql: sql, values: values});
    });
  }

  //拥有transaction的连接
  trans(){
    return using(this.getTransaction(), (connection) =>{
      return connection;
    });
  }

  //获取连接
  getConn(){
    return using(this.getConnection(), (connection) =>{
      return connection;
    });
  }
}
module.exports = Pool;