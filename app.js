var express = require('express');
var app = express();

var fs = require("fs");
var path = require('path');
var bodyParser = require('body-parser');
var multer  = require('multer');
var routes = require('./router/router');
var adminroutes = require('./router/adminrouter');
var sessionmiddle = require('./middleware/session');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: '/tmp/'}).array('image'));
app.use(sessionmiddle.middle);
// app.all("*", function(request, response, next) {
//   response.writeHead(200, { "Content-Type": "text/plain" });
//   next();
// });

app.use('/', routes); 
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

});
//node-inspector