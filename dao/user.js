var mysqlclient=new (require('../dao/MysqlImpl'))();
var redisclient = require('../dao/redisClient');
var userDao={};

userDao.login=function(name,pwd,cb) {
	let sql="select * from user where name=? AND password=? ";
	let queryarr=[{query:sql,params:[name,pwd]}];
	mysqlclient.exec(queryarr,function(err,result){
		if(err)
			return cb(err);
		if(result.detail.length==0)
		{
			return cb('用户名密码错误');
		}
		cb(null,result.detail[0]);
	});

};

module.exports = userDao;
