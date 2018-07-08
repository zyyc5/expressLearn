var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer  = require('multer');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require("fs");
var path = require('path');
const controller = require('../src/controller/homeController');
const cosDll = require('../lib/cos');
const imageDomain = 'http://image.qicheen.com/';

/* GET home page. */
router.get('/', controller.home);
router.get('/index', controller.home);

router.get('/about', function(req, res) {
  res.render('about', { title: 'about' });
});

router.get('/product', controller.product);
router.get('/product-more/:cat', controller.productMore);
router.get('/product-detail/:id.html', controller.productDetail);

router.get('/news', controller.newsCenter);
router.get('/newsDetail/:id.html', controller.newsDetail);
router.get('/cases', controller.caselist);
router.get('/caseDetail/:id.html', controller.caseDetail);


router.post('/file_upload', function (req, res) {

   console.log(req.files);  // 上传的文件信息

   // 获得文件的临时路径
   var tmp_path = req.files.file[0].path;
   let responseUrl = '/upload/' + req.files.file[0].filename + '_' + req.files.file[0].originalname
   var target_path = 'public' + responseUrl;
   let filekey = req.files.file[0].filename + '_' + req.files.file[0].originalname;
   fs.readFile(tmp_path, function (err, data) {
		cosDll.put(filekey, data,(err,result)=>{
		// 移动文件
			fs.rename(tmp_path, target_path, function(err) {
				fs.unlink(tmp_path, function() {});
			});

			let response = {
				message:'success', 
				url: (!err&&result&&result.statusCode == 200)?(imageDomain + filekey) : responseUrl//result.Location
			};
			res.send(200, response);

		});
	});

})

module.exports = router;