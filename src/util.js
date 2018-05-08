'use strict';
const Promise = require('bluebird');
const uuid = require('uuid');
const common = require('./common');

let util = {
    get UUID(){
  		return uuid.v4().replace(/-/g, '');
    },
    get now(){
        return Math.round(new Date().getTime()/1000);
    }
};


/**
 * 根据sql语句自动选择对应的数据库，qichacha 还是 qichacha_extend,可写 还是 只读
 * @param sql 需要执行的sql语句
 * @param schemasNo 需要连接的数据库。1：qichacha、2：qichacha_extend, 3: qcc_data_user_re 4:qichacha_api_log  默认1
 * @returns {*}
 */
util.getQueryConnection = (sql, schemasNo = 1) => {
    let dmlType = sql.trim().substring(0, 6).toLowerCase();
    if (dmlType === 'insert' || dmlType === 'update' || dmlType === 'delete'){
      //连接写数据库
      if (schemasNo === 1){
        //qichacha(write)
        return common.MSQLInstance;
      } 
    } else {
      //连接读数据库
      if (schemasNo === 1){
        //qichacha(read)
        return common.MSQLInstance;
      } 
    }
  };
  
  /**
   * 执行SQL
   * Create by Zhangyayun
   *
   * @param sql 需要执行的sql语句
   * @param values sql参数
   * @param schemasNo 需要连接的数据库。1：qichacha、2：qichacha_extend, 3: qcc_data_user_re  默认1
   * @returns {*}
   */
  util.query = (sql, values, schemasNo = 1) => {
    return getQueryConnection(sql, schemasNo).query(sql, values);
  };
  
  
  /*
  * 批量执行sql，尽量模拟事务操作，如果都是写语句或者都是读语句可以保证事务性，如果是读写混合的语句，那么会分成两个事务
  * Create by Zhangyayun
  *
  * @param querys 批量语句，形式有两种选择
  * 1,[item...]                       串行顺序执行，所以速度会慢一些，使用Promise.mapSeries实现
  * 2,{query1:item,query2:item2...}   无序并行执行，使用Promise.props实现
  * 两种参数形式中的 item 同样还有两种形式 [sql,values] OR {sql: sql, values: values} 效果是一样的，推荐第一种数组的形式
  *
  * @param schemasNo 需要连接的数据库。1：qichacha、2：qichacha_extend, 3: qcc_data_user_re  默认1
  *
  * @returns Promise, resolve结果形式与参数querys有关,querys=>数组，那么returns=>数组
  * */
 util.queryTranstions = (querys, schemasNo = 1)=>{
  
    let writeAbleConnect = null;
    let readAbleConnect = null;
  
    for (let i in querys) {
      let query = querys[i];
      let sql = null;
      if (Array.isArray(query))
        sql = query[0];
      else if (typeof  query === 'object')
        sql = query.sql;
      else
        continue;
  
      let dmlType = sql.trim().substring(0, 6).toLowerCase();
      if (!writeAbleConnect&&(dmlType === 'insert' || dmlType === 'update' || dmlType === 'delete'))
        writeAbleConnect = getQueryConnection(sql, schemasNo);
      if (!readAbleConnect && dmlType === 'select')
        readAbleConnect = getQueryConnection(sql, schemasNo);
    }
  
    //由pool实例获取transtion连接
    let getTransConnect = (wcon, rcon)=>{
      if (wcon&&rcon)
        return wcon.trans().then((wConn)=>{
          return rcon.getConn().then((reConn)=>{
            return {'wConn': wConn, 'rConn': reConn};
          });
        });
      if (wcon&&!rcon)
        return wcon.trans().then((conn)=>{
          return {'wConn': conn, 'rConn': null};
        });
      if (!wcon&&rcon)
        return rcon.getConn().then((conn)=>{
          return {'wConn': null, 'rConn': conn};
        });
      return Promise.resolve({'wConn': null, 'rConn': null});
    };
  
    //根据sql语句选择连接
    let choseConnect = (sql, wcon, rcon)=>{
      let dmlType = sql.trim().substring(0, 6).toLowerCase();
      return dmlType === 'select'? rcon : wcon;
    };
  
    //提交并释放连接
    let commit = (wConn, rConn)=>{
      return new Promise((resolve, reject)=>{
        if (wConn)
          wConn.commit((err)=>{
            if (err) {
              console.log('commit异常，释放连接',err);
              releaseWithRollBack(wConn,rConn);
              return reject(err);
            }
            wConn.release();
            resolve(true);
          });
        else
          resolve(true);
      });
    };
  
    //回滚并释放连接
    let releaseWithRollBack = (wConn, rConn)=>{
      if(wConn) {
        wConn.rollback();
        wConn.release();
      }
    };
  
    //释放连接
    let release = (wConn, rConn)=>{
      if(wConn)
        wConn.release();
      // if(rConn)
      //   rConn.release();
    };
  
    return getTransConnect(writeAbleConnect, readAbleConnect).then(({wConn, rConn})=>{
      //有序执行
      if (Array.isArray(querys))
        return Promise.mapSeries(querys, (query)=>{
          let {sql, values} = query;
          if (Array.isArray(query))
            [sql, values] = query;
          return choseConnect(sql, wConn, rConn).queryAsync({sql: sql, values: values});
        }).then(result=>{
          return commit(wConn, rConn).then(()=>result);
        }).catch(err=>{
          releaseWithRollBack(wConn,rConn);
          console.log('异常，释放连接',err);
          return Promise.reject(err);
        });
  
      //无序执行
      let queryPromise = {};
      for (let p in querys){
        let {sql, values} = querys[p];
        if (Array.isArray(querys[p]))
          [sql, values] = querys[p];
        queryPromise[p] = choseConnect(sql, wConn, rConn).queryAsync({sql: sql, values: values});
      }
  
      return Promise.props(queryPromise).then(result=>{
        return commit(wConn, rConn).then(()=>result);
      }).catch(err=>{
        releaseWithRollBack(wConn,rConn);
        console.log('异常，释放连接',err);
        return Promise.reject(err);
      });
    });
  };
  

  module.exports =  util;




