const service = require('../service/postService');


/**
 * 新增文章/文章详情 页
 * @param {*} req 
 * @param {*} res 
 */
let posts = (req, res)=>{
    service.getAllCat(0).then(allcats=>{
        if(!req._param.postid)
            return res.render('admin/postsEdit', { title: '发布新文章', post: null, allcats: allcats.data });
        service.getPostdetail(req._param).then(result=>{
            return res.render('admin/postsEdit', { title: '编辑', post: result.data, allcats: allcats.data });
        })
    })
}

/**
 * 添加 或 更新
 * @param {*} req 
 * @param {*} res 
 */
let addPosts = (req, res)=>{
    if(!req._param.post_id)
        return service.addPosts(req._param).then(result=>{
            res.send(200,result);
        });
    service.updatePost(req._param).then(result=>{
        res.send(200,result);
    });
};

/**
 * 删除
 * @param {*} req 
 * @param {*} res 
 */
let delPost = (req, res)=>{
    return service.delPost(req._param).then(result=>{
        res.send(200,result);
    });
};

/**
 * 文章列表页
 * 
 */
let postList = (req, res)=>{
    service.getAllCat().then(allcats=>{
        service.getPostList(req._param).then(result=>{
            // res.send(200,result);
            res.render('admin/postslist', { title: '文章列表', posts: result, allcats: allcats.data, cat_id: req._param.post_cat?req._param.post_cat:'0'  });
        });
    });
}

module.exports = {
    addPosts,
    postList,
    posts,
    delPost,
}