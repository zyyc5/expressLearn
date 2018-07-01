var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer  = require('multer');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require("fs");
var path = require('path');
const cosDll = require('../lib/cos');
const imageDomain = 'http://image.qicheen.com/';

/* GET home page. */
router.get('/', function(req, res) {
	// res.cookie('_node_Session','_jcvbnm');
	let cookies=[];
	cookies.push(req.get('cookie'));
	console.log("Cookies: ", req.get('cookie'));
  res.render('index', { title: 'Express',cookies:cookies });
});
router.get('/index', function(req, res) {
	// res.cookie('_node_Session','_jcvbnm');
	let cookies=[];
	cookies.push(req.get('cookie'));
	console.log("Cookies: ", req.get('cookie'));
  res.render('index', { title: 'Express',cookies:cookies });
});

router.get('/about', function(req, res) {
   
   console.log("router: ", 'about');
  res.render('about', { title: 'about' });
});

router.get('/', function (req, res) {
	res.send('Hello World');
})

router.get('/process', function (req, res) {

   // 输出 JSON 格式
   var response = {
   	"first_name":req.query.first_name,
   	"last_name":req.query.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

router.post('/process',urlencodedParser, function (req, res) {
	console.log(req.body);
   // 输出 JSON 格式
   var response = {
   	"first_name":req.body.first_name,
   	"last_name":req.body.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

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