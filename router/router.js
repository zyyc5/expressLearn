var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer  = require('multer');
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

/* GET home page. */
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

   console.log(req.files[0]);  // 上传的文件信息

   var des_file = __dirname + "/" + req.files[0].originalname;
   fs.readFile( req.files[0].path, function (err, data) {
   	fs.writeFile(des_file, data, function (err) {
   		if( err ){
   			console.log( err );
   		}else{
   			response = {
   				message:'File uploaded successfully', 
   				filename:req.files[0].originalname
   			};
   		}
   		console.log( response );
   		res.end( JSON.stringify( response ) );
   	});
   });
})

module.exports = router;