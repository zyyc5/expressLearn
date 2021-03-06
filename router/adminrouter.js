var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
var multer  = require('multer');
var bodyParser = require('body-parser');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const controller = require('../src/controller/postController');
var JsonResponse = require('../model/JsonResponse'); 
const adminController = require('../src/controller/adminController');

router.all('*',function(req,res,next){
	if(!req.session.get().user&&req.path.indexOf('/login')==-1)
		return res.redirect('/admin/login');
	res.locals = {isLogin:true, menus: req.session.get().menus, user: req.session.get().user};
	if(req.session.get().user&&!req.session.get().menus)
		return adminController.allMenu().then(function(menus){
			req.session.get().menus = menus;
			req.session.update();
			res.locals.menus = menus;
			next();
		});
	next();
});

/* GET home page. */
router.get('/login', function(req, res) {
	if(req.session.get().user)
		return res.redirect('/admin/home');
	res.render('admin/index', { title: '登录' });
});

router.get('/logout', function(req, res) {
	req.session.clear(function(){
		res.redirect('/admin/login');
	});
	
});

router.get('/home', function(req, res) {
	
	res.render('admin/home', adminRender(req).add('title','欢迎'));

});

router.get('/chart', function(req, res) {
	res.render('admin/chart', adminRender(req).add('title','报表'));
});

function RenderObj(req){
	let me = this;
	this.add = function(key,value){
		me[key] = value;
		return me;
	};

	if(req.session.get())
	{
		me.user = req.session.get().user;
		me.menus = req.session.get().menus;
	}
}

var adminRender = function(req){return new RenderObj(req);}

router.post('/login', function(req, res) {
	adminController.login(req._param).then(result=>{
		if(!result.success)
			return res.send(result);
		req.session.get().user = result.data;
		req.session.update();
		res.send(result);
	})
	// res.json(JsonResponse.success({name:'zyy'}));
});


router.get('/test', function(req, res) {
	
	res.render('admin/test', { title: '欢迎' });
});


router.get('/posts', controller.posts);

router.post('/imageupload', function (req, res) {

	console.log(req.files[0]);  // 上传的文件信息
 
	var des_file = __dirname + "/" + req.files[0].originalname;
	let response = {};
	fs.writeFile(des_file, req.files[0], function (err) {
		if( err ){
			console.log( err );
		}else{
			response = {
				message:'File uploaded successfully', 
				filename: des_file
			};
		}
		console.log( response );
		res.end( JSON.stringify( response ) );
	});

 });

 router.get('/imageupload', function (req, res) {
	res.end( JSON.stringify( {
		message:'not support get', 
		filename: ''
	} ) );
 });

 router.post('/addposts', controller.addPosts);
 router.get('/postlist/:post_cat', controller.postList);
 router.post('/delposts', controller.delPost);



 module.exports = router;