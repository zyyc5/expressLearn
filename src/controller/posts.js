const service = require('../service/postService');


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let addPosts = (req, res)=>{
    service.addPosts(req._param).then(result=>{
        res.send(200,result);
    })
}


module.exports = {
    addPosts,
}