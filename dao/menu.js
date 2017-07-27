var mysqlclient=new (require('../dao/MysqlImpl'))();
var redisclient = require('../dao/redisClient');
var utils = require('util')
// console.log(mysqlclient,redisclient);
var menu={};

menu._all=null;

menu.all = function(cb) {
	if(menu._all){
		// console.log(JSON.stringify(menu._all))
		return cb(null,JSON.parse(JSON.stringify(menu._all)));
	}
	let queryarr=[{query:'SELECT a.*,b.name pname from (SELECT * FROM `admin_menu` where parentId is not NULL) a LEFT JOIN (SELECT * FROM `admin_menu` where parentId is NULL) b on a.parentId=b.Id; '}]

	mysqlclient.exec(queryarr,function(err,result){
		if(err)
			return cb(err);
		let rows = result.detail;
		let menus=[];
		rows.forEach(function(item){
			let hasexit = false;
			menus.forEach(function(m){
				if(m.id==item.parentId){
					hasexit=true;
					m.child.push({id:item.id,name:item.name,url:item.url});
				}
			});
			if(!hasexit){
				let pmenu={id:item.parentId,name:item.pname,child:[]};
				pmenu.child.push({id:item.id,name:item.name,url:item.url});
				menus.push(pmenu);
			}
		});
		menu._all = menus;
		cb(null,menus);
	});
};
module.exports = menu;