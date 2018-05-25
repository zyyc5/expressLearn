const service = require('../service/postService');



let posts = (req, res)=>{
    service.getAllCat().then(allcats=>{
        if(!req._param.postid)
            return res.render('admin/postsEdit', { title: '发布新文章', post: null, allcats: allcats });
        service.getPostdetail(req._param).then(result=>{
            return res.render('admin/postsEdit', { title: '编辑', post: result.data, allcats: allcats });
        })
    })
}

/**
 * 添加
 * @param {*} req 
 * @param {*} res 
 */
let addPosts = (req, res)=>{
    service.addPosts(req._param).then(result=>{
        res.send(200,result);
    })
}


let postList = (req, res)=>{
    service.getPostList(req._param).then(result=>{
        // res.send(200,result);
        res.render('admin/postslist', { title: '文章列表', posts: result });
    })
}

module.exports = {
    addPosts,
    postList,
    posts,
}