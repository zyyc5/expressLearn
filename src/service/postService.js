const util = require('../util');
const responsemodel = require('../../model/JsonResponse');
const Promise = require('bluebird');

let addPost = ({title, content, post_cat,sort_index=99})=>{

    if(!title||!content||!post_cat)
        return Promise.resolve(responsemodel.error('参数异常'))
    let posts = {};
    posts.cat_id = parseInt(post_cat);
    posts.title = title;
    posts.content = content;
    posts.sort_index = sort_index;
    posts.cdate = util.now;
    posts.update_date = posts.cdate;
    posts.post_date = util.nowStr;

    let sql = ' insert into cc_posts set ?';
    return util.query(sql,posts).then(result=>{
        if(result.affectedRows>0)
            return responsemodel.success();
    }).catch(e=>{
        return responsemodel.error(e.toString())
    });

};


let getPostList = ({post_cat=0, pageIndex=1, pageSize=20})=>{
    try{
        pageIndex = parseInt(pageIndex);
        pageSize = parseInt(pageSize);
        post_cat = parseInt(post_cat);
    }catch(e){
        return Promise.resolve(responsemodel.error('参数异常'))
    }
    let offset = pageSize * (pageIndex - 1);
    let catCondition = post_cat? ' AND cat_id=?':'';
    let option = post_cat? [post_cat]:[];
    option.push(pageSize);
    let sql = `select * from cc_posts where is_del=0 ${catCondition} order by sort_index ,update_date desc limit ${offset}, ?`;
    let countSql = 'select count(1) c from cc_posts where is_del=0 AND cat_id=? ';
    return util.queryTranstions([[sql,option],[countSql,[post_cat]]]).then(result=>{
        let count = result[1][0].c;
        let ulist = result[0];
        return responsemodel.success(ulist,count, pageIndex, pageSize);
    });
}

let getPostdetail = ({postid})=>{
    try{
        postid = parseInt(postid);
    }catch(e){
        return Promise.resolve(responsemodel.error('参数异常'))
    }

    let sql = `select * from cc_posts where is_del=0 AND id=?`;
    return util.query(sql, [postid]).then(result=>{
        let postobj = null;
        if(result.length>0)
            postobj = result[0];
        return responsemodel.success(postobj);
    });
}

let getAllCat = ()=>{
    let sql = 'select * from cc_posts_cat ';
    return util.query(sql).then(result=>{
        return responsemodel.success(result);
    })
}

module.exports = {
    addPosts: addPost,
    getPostList,
    getPostdetail,
    getAllCat,
}