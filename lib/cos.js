const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');

const SecretId = 'AKID1rVwABSJRM3atxvPozwfEZgYCcno9Ecm'; // 替换为用户的 SecretId
const SecretKey = 'B9tPhmdGepmVzFG1ZsXyCCxb5LODoBLH';    // 替换为用户的 SecretKey
const Bucket = 'webimage-1255385854';                        // 替换为用户操作的 Bucket
const Region = 'ap-chengdu';                           // 替换为用户操作的 Region

const cos = new COS({SecretId: SecretId, SecretKey: SecretKey});


let put = (key, body, cb)=>{
    cos.putObject({
        Bucket: Bucket,
        Region: Region,
        Key: key,
        Body: body
    }, function (err, data) {
        console.log(err || data);
        cb(err, data);
    });
}

module.exports = {
    put,
};