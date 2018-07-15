const util = require('../util');
const responsemodel = require('../../model/JsonResponse');
const Promise = require('bluebird');
const salt = 'SQJZX';

let login=({name,pwd})=> {
	pwd = util.md5(pwd+salt);
	let sql="select * from user where name=? AND password=? ";
	let queryarr=[{query:sql,params:[name,pwd]}];
	return util.query(sql,[name,pwd]).then(result=>{
        if(!result.length)
            return Promise.reject('账号或密码错误');
        return Promise.resolve(result[0]);
    });

};


let allMenu = ()=>{
    let sql = 'SELECT a.*,b.name pname from (SELECT * FROM `admin_menu` where parentId is not NULL) a LEFT JOIN (SELECT * FROM `admin_menu` where parentId is NULL) b on a.parentId=b.Id;';
    return util.query(sql).then(result=>{
        let rows = result;
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
				let pmenu={id:item.parentId, name:item.pname, child:[]};
				pmenu.child.push({id:item.id, name:item.name, url:item.url});
				menus.push(pmenu);
			}
        });
        return menus;
    });
}


module.exports = {
    login,
    allMenu,
}