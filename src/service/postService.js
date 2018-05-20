const util = require('../util');
const responsemodel = require('../../model/JsonResponse');
const Promise = require('bluebird');

let addPost = ({title, content, post_cat,sort_index})=>{

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

    let sql = ' insert into cc_posts ?';
    return util.query(sql,posts).then(result=>{
        if(result.affactRow>0)
            return responsemodel.success();
    }).catch(e=>{
        return responsemodel.error(e.toString())
    });

};

module.exports = {
    addPosts: addPost,
}