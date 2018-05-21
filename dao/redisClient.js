const config = require('../src/config');


var redis = require('redis'),
    RDS_PORT = config.NodeJsRedisConfig.port,//32768,        //端口号
    RDS_HOST = config.NodeJsRedisConfig.host,    //服务器IP
    RDS_PWD = config.NodeJsRedisConfig.redisSecret,    //密码    
    RDS_OPTS = {};           //设置项

let RedisClient= {};

RedisClient.connect = function(cb){
    let  client = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS);
    // client.auth(RDS_PWD,function(){
    //     console.log('通过认证');
    // });

    client.on('connect',function(){
       cb(client);
    });

    client.on('ready',function(err){
        // console.log('ready');
    });

    client.on('error', function (err) { console.log('error event - ' + redis.host + ':' + redis.port + ' - ' + err); });
}

 RedisClient.get = function(dkey,cb){
    RedisClient.connect(function(client){
        client.get(dkey,function(err,res){
            cb(err,res);
            // client.end();
        });
    });
 }


 RedisClient.set = function(dkey ,value , cb){
    RedisClient.connect(function(client){
        client.set(dkey,value,function(){
            cb(null);
            // client.end();
        });
        
    });
 }



module.exports = RedisClient;
