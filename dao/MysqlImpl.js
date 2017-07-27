var async =require('async');
var MysqlImpl  = function(host, user, pwd, db) {
	host = host?host:'127.0.0.1';
	user = user?user:'root';
	pwd = pwd?pwd:'root';
	db = db?db:'express';

	this.host = host;
	this.user = user;
	this.pwd = pwd;
	this.db = db;
	var me = this;
	var mysql = require('mysql');
	var pool  = mysql.createPool({
		connectionLimit : 10,
		host            : host,
		user            : user,
		password        : pwd,
		database        : db
	});

	
	this.execCommand = function(queryAndParamsArray, callback, errorCallback) {
		pool.getConnection(function(err, connection) {
			 if (err) {
			 	
			    errorCallback(err, true);
			    return;
			 }
			
			var rows = [];
			
			var doQuery = function(idx, sqltext, isSelect, conn,cb) {
				var result = {row:[],rowsAffected:0};
				conn.query(sqltext, function (error, results, fields) {
				  if (error) {
				  	console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
				  	console.log("ERROR: ");
			 		console.log(sqltext);
			 		if(error.message.toLowerCase().indexOf("duplicate column") == -1) {
			 			alert(sqltext + " <<<<<------>>>>>:" + error.message);
			 		}
				  	return cb(error);
				  }
				  if(isSelect) {
				  	result.row = results == null ? [] : results;
				  }
				  else{
				  	result.rowsAffected = results.affectedRows;
				  }
				  rows[idx] = result;
				  cb(null, idx);
				});
			}
			var fallcall = function(idx, sqltext, isSelect, connection) {
				this.idx = idx;
				this.sqltext = sqltext;
				this.isSelect = isSelect;
				this.conn = connection;
				var me = this;
				this._doQuery = function(cb) {
					doQuery(me.idx, me.sqltext, me.isSelect, me.conn, cb);
				}
			}
			connection.beginTransaction(function(err) {
				if (err) { 
					connection.release();
					errorCallback(err);
			    	return;
				}
				
				var funcArray = [];
				
				var pushArray = function(fc) {
					funcArray.push(function(cb) {
						fc._doQuery(cb);
					});					
				}
				for(var idx in queryAndParamsArray) {
					var sqltext = queryAndParamsArray[idx].query.trim();
					var paramlist = queryAndParamsArray[idx].params == null ? [] : queryAndParamsArray[idx].params;
					// sqltext = sqltext.Replace("datetime(?)", "?");
					sqltext = me.formatSql(sqltext,paramlist);
					var fc = new fallcall(idx, sqltext, sqltext.toLowerCase().startsWith("select"), connection);
					pushArray(fc);
				}
				async.series(funcArray,
				 	function(err, results){
				 		connection.release();
				 		if(err) {
				 			return errorCallback(err);
				 		}
					  	connection.commit(function(err) {
					        if (err) {
					          	return connection.rollback(function() {
					          		return errorCallback(err);
					          	});
					        }
					        return callback(null, rows);
					    });
				 		
				});
			});
		});
	}
	
	this.formatSql = function(sqltext, paramlist){
        var sql = sqltext;
        
        // fill in params
		sql = mysql.format(sql, paramlist);
        return sql;
	}

	this.exec=function(queryAndParamsArray, cb){
		me.execCommand(queryAndParamsArray,function(err,rows){
			resultList = [];
			affectRowsResult = [];
			experResultList = [];

			for (var index in rows) {
				var row = rows[index];
				affectRowsResult.push(row.rowsAffected);
				resultList = resultList.concat(row.row);
				experResultList.push(row.row);
			}
			var jsonSuccess = { result: 'success', desc: "success", detail: resultList, rowsAffected: affectRowsResult, expDetail: experResultList };
			cb(null,jsonSuccess);
		},function(error, isDisConnect){

			if(isDisConnect == true) {
				return cb({ message: "无法连接到数据库"});
			}
			if (error && error.message.indexOf('ALTER TABLE') < 0 && error.message.indexOf('duplicate column') < 0) {

				return cb(error);
			}
		});
	};
	
}

module.exports = MysqlImpl;
