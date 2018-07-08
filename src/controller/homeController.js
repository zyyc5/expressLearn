const service = require('../service/postService');


let home = (req, res)=>{
    service.getPostList({post_cat: 1, pageSize:12}).then(result=>{
        return res.render('index', { title: '匠之心园林绿化', data: result.data.data});
    })
}

let product = (req, res)=>{
    let pageIndex = req._param.pageIndex?req._param.pageIndex:1;
    let pageSize = 12;
    let cat_id = req._param.cat;
    service.getPostList({ post_cat: 1, pageIndex, pageSize}).then(result=>{
        return res.render('product', { title: '产品展示', data: result.data.data, pageInfo: result.data.pageinfo });
    })

}

let productMore = (req, res)=>{
    let pageIndex = req._param.pageIndex?req._param.pageIndex:1;
    let pageSize = 12;
    let cat_id = req.params.cat;
    if(!cat_id)
        return res.redirect('/');
    service.getCatDetail(cat_id).then(catDetail=>{
        if(!catDetail)
            return res.redirect('/');
        service.getPostList({post_cat: cat_id, pageIndex, pageSize}).then(result=>{
            return res.render('product', { title: '产品展示-'+catDetail.cat_name, data: result.data.data, pageInfo: result.data.pageinfo});
        })
    })
}

let productDetail = (req, res)=>{
    
    let id = req.params.id;
    if(!id)
        return res.redirect('/');
    service.getPostdetail({guid:id}).then(postDetail=>{
        if(!postDetail)
            return res.redirect('/');
        return res.render('product-detail', { title: '产品详情-'+postDetail.data.title, data: postDetail.data });
    })
}

let newsCenter = (req, res)=>{
    let pageIndex = req._param.pageIndex?req._param.pageIndex:1;
    let pageSize = 12;
    let cat_id = req._param.cat;
    service.getPostList({ post_cat: 3, pageIndex, pageSize}).then(result=>{
        return res.render('newscenter', { title: '新闻中心', data: result.data.data, pageInfo: result.data.pageinfo });
    })
}

let newsDetail = (req, res)=>{
    
    let id = req.params.id;
    if(!id)
        return res.redirect('/');
    service.getPostdetail({guid:id}).then(postDetail=>{
        if(!postDetail)
            return res.redirect('/');
        return res.render('news-detail', { title: '新闻详情-'+postDetail.data.title, data: postDetail.data });
    })
}

let caselist = (req, res)=>{
    let pageIndex = req._param.pageIndex?req._param.pageIndex:1;
    let pageSize = 12;
    service.getPostList({ post_cat: 2, pageIndex, pageSize}).then(result=>{
        return res.render('caselist', { title: '工程案例', data: result.data.data, pageInfo: result.data.pageinfo });
    })
}

let caseDetail = (req, res)=>{
    
    let id = req.params.id;
    if(!id)
        return res.redirect('/');
    service.getPostdetail({guid:id}).then(postDetail=>{
        if(!postDetail)
            return res.redirect('/');
        return res.render('case-detail', { title: '案例详情-'+postDetail.data.title, data: postDetail.data });
    })
}

module.exports = {
    home,
    product,
    productMore,
    productDetail,
    newsCenter,
    newsDetail,
    caselist,
    caseDetail,
}