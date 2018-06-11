const util = require('../util');
const responsemodel = require('../../model/JsonResponse');
const Promise = require('bluebird');

/**
 * 新增文章
 * @param {*} param0 
 */
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
        return responsemodel.error('新增失败');
    }).catch(e=>{
        return responsemodel.error(e.toString())
    });

};

/**
 * 修改文章
 * @param {*} param0 
 */
let updatePost = ({post_id, title, content, post_cat,sort_index=99})=>{

    if(!post_id||!title||!content||!post_cat)
        return Promise.resolve(responsemodel.error('参数异常'))

    let option = [parseInt(post_cat),title,content,sort_index,util.now,util.nowStr,post_id];
    let sql = ' update cc_posts set cat_id=?,title=?,content=?,sort_index=?,update_date=?,post_date=? where id=? AND is_del=0';
    return util.query(sql,option).then(result=>{
        if(result.affectedRows>0)
            return responsemodel.success();
        return responsemodel.error('更新失败');
    }).catch(e=>{
        return responsemodel.error(e.toString())
    });

};

/**
 * 删除文章
 * @param {*} param0 
 */
let delPost = ({post_id})=>{
    if(!post_id)
        return Promise.resolve(responsemodel.error('参数异常'))

    let option = [post_id];
    let sql = ' update cc_posts set is_del=1 where id=? AND is_del=0';
    return util.query(sql,option).then(result=>{
        if(result.affectedRows>0)
            return responsemodel.success();
        return responsemodel.error('删除失败');
    }).catch(e=>{
        return responsemodel.error(e.toString())
    });
}

/**
 * 文章列表
 * @param {*} param0 
 */
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
    let countSql = ` select count(1) c from cc_posts where is_del=0 ${catCondition} `;
    return util.queryTranstions([[sql,option],[countSql,option]]).then(result=>{
        let count = result[1][0].c;
        let ulist = result[0];
        return responsemodel.success(ulist,count, pageIndex, pageSize);
    });
}

/**
 * 文章详情
 * @param {*} param0 
 */
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

/**
 * 全部类别
 */
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
    updatePost,
    delPost,
}