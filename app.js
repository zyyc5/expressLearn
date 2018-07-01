const express = require('express');
const app = express();

const fs = require("fs");
const path = require('path');
const bodyParser = require('body-parser');
const multer  = require('multer');
const routes = require('./router/router');
const adminroutes = require('./router/adminrouter');
const sessionmiddle = require('./middleware/session');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(multer({ dest: '/tmp/'}).array('image'));
app.use(sessionmiddle.middle);

const upload = multer({dest: 'public/temp/'})
app.use(upload.fields([{ name: 'file', maxCount: 1 },{name:'file1',maxCount:1}]))
// app.use(upload.array('image'));

// app.all("*", function(request, response, next) {
//   response.writeHead(200, { "Content-Type": "text/plain" });
//   next();
// });

app.use((req, res, next)=>{
    req.body;
    req._param = req.method == "GET"?req.query: req.body;
    next();
})

app.use('/', routes); 
app.use(express.static('public'));

app.use('/admin', adminroutes); 

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    if(err.status == 500)
        console.error(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

var server = app.listen(8081, function () {

	var host = server.address().address
	var port = server.address().port

	console.log("应用实例，访问地址为 http://%s:%s", host, port)
    var c = require('child_process');
    c.exec(`start http://localhost:${port}`);
});
//node-inspector