const service = require('../service/adminService');
const responseMode = require('../../model/JsonResponse');


let login = (param)=>{
    return service.login(param).then(user=>{
        return responseMode.success(user);
    }).catch(err=>{
        return responseMode.error(err);
    })
}

let allMenu = ()=>{
    return service.allMenu();
}

module.exports = {
    login,
    allMenu,
}
