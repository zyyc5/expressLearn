'use strict';

const config = {
    MYSQL:{
        host: 'localhost',
        port: 6379,
        user: 'root',
        password: '',
        database: 'express',
        connectionLimit: 10
    },
    NodeJsRedisConfig : {
        'port': 6379,
        'host': '127.0.0.1',
        'redisSecret': ''
    },
    webSite:{
        phone: '18862323234',
        address: '沭阳县新河镇XXXX花木产业园'
    }
};


module.exports =  config;