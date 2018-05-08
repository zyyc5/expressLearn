'use strict';

const config = {
    MYSQL:{
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'express',
        connectionLimit: 10
    },
    NodeJsRedisConfig : {
        'port': 32768,
        'host': '127.0.0.1',
        'redisSecret': ''
    }
};


module.exports =  config;