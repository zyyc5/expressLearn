let JsonResponse= {};

JsonResponse.success = function(data, totalrecords, pageindex, pagesize=20){
	if(totalrecords&&pageindex){
		let pageinfo = {
			'count': totalrecords,
			'currentpage': pageindex,
			'totalpage': Math.ceil(totalrecords/pagesize)
		};
		return {success:true,data:{data, pageinfo},msg:'success'};
	}
	return {success:true,data:data,msg:'success'};
}

JsonResponse.error = function(errormsg){
	return {success:false,data:null,msg:errormsg};
}

JsonResponse.custome = function(success,data,msg){
	return {success:success,data:data,msg:msg};
}

module.exports = JsonResponse;