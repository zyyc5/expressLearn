const util = require('../util');
const responsemodel = require('../../model/JsonResponse');
const Promise = require('bluebird');

/**
 * 新增文章
 * @param {*} param0 
 */
let addPost = ({title, content, post_cat,coverUrl,sort_index=99})=>{

    if(!title||!content||!post_cat)
        return Promise.resolve(responsemodel.error('参数异常'))
    if(!coverUrl)
        coverUrl = 'http://image.qicheen.com/8fe9ede3bdd7e0a98e998c69cffc1169_defaultFood.jpg';
    let posts = {};
    posts.cat_id = parseInt(post_cat);
    posts.guid = util.UUID;
    posts.title = title;
    posts.content = content;
    posts.cover = coverUrl;
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
let updatePost = ({post_id, title, content,coverUrl, post_cat,sort_index=99})=>{

    if(!post_id||!title||!content||!post_cat)
        return Promise.resolve(responsemodel.error('参数异常'))
    if(!coverUrl)
        coverUrl = 'http://image.qicheen.com/8fe9ede3bdd7e0a98e998c69cffc1169_defaultFood.jpg';
    let option = [parseInt(post_cat),title,content,coverUrl,sort_index,util.now,util.nowStr,post_id];
    let sql = ' update cc_posts set cat_id=?,title=?,content=?,cover=?,sort_index=?,update_date=?,post_date=? where id=? AND is_del=0';
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
    let catCondition = post_cat? ' AND (cat_id=? OR cat_id in (select cat_id from cc_posts_cat where parent=?))':'';
    let option = post_cat? [post_cat,post_cat]:[];
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
 * 文章列表
 * @param {*} param0 
 */
let getPostList4Home = ({post_cat=0, pageIndex=1, pageSize=20})=>{
    try{
        pageIndex = parseInt(pageIndex);
        pageSize = parseInt(pageSize);
        post_cat = parseInt(post_cat);
    }catch(e){
        return Promise.resolve(responsemodel.error('参数异常'))
    }
    let offset = pageSize * (pageIndex - 1);
    let catCondition = post_cat? ' AND (cat_id=? OR cat_id in (select cat_id from cc_posts_cat where parent=?))':'';
    let option = post_cat? [post_cat,post_cat]:[];
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
let getPostdetail = ({postid,guid})=>{
    try{
        postid = parseInt(postid);
    }catch(e){
        return Promise.resolve(responsemodel.error('参数异常'))
    }

    let sql = `select * from cc_posts where is_del=0 AND id=?`;
    let option = [postid];
    if(guid){
        sql = 'select * from cc_posts where is_del=0 AND guid=?';
        option = [guid];
    }
    return util.query(sql, option).then(result=>{
        let postobj = null;
        if(result.length>0)
            postobj = result[0];
        return responsemodel.success(postobj);
    });
}

/**
 * 全部类别
 */
let getAllCat = (parent)=>{
    let sql = 'select * from cc_posts_cat where parent is null OR parent=0';
    if(parent)
        sql = 'select * from cc_posts_cat where parent=?';
    if(parseInt(parent)==0)
        sql = 'select * from cc_posts_cat';
        
    return util.query(sql, [parent]).then(result=>{
        return responsemodel.success(result);
    })
}

/**
 * 类别详情
 * @param {类别id} cat_id 
 */
let getCatDetail = (cat_id)=>{
    let sql = 'select * from cc_posts_cat where cat_id=?';
    return util.query(sql, [cat_id]).then(result=>{
        return result.length>0?result[0]:null;
    })
}

module.exports = {
    addPosts: addPost,
    getPostList,
    getPostdetail,
    getAllCat,
    updatePost,
    delPost,
    getCatDetail,
}