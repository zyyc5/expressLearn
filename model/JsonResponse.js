let JsonResponse= {};

JsonResponse.success = function(data){
	return {success:true,data:data,msg:'success'};
}

JsonResponse.error = function(errormsg){
	return {success:false,data:null,msg:errormsg};
}

JsonResponse.custome = function(success,data,msg){
	return {success:success,data:data,msg:msg};
}

module.exports = JsonResponse;