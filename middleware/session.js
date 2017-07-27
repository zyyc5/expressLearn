var redisclient = require('../dao/redisClient');
const uuidv4 = require('uuid/v4');
var sessionmiddle={};

sessionmiddle.newSessionId = function(){
	return uuidv4();
};

sessionmiddle.sessionName = function(){
	return '_node_session';
};

sessionmiddle.getSessionId = function(cookeie,sessionkey){
	// console.log(' in cookeie ',cookeie,sessionkey)
	let sessionid = null;
	if(cookeie&&cookeie.length>0)
	{
		// debugger;
		try{
			let cookeies = cookeie.split(';');
			cookeies.forEach(function(item){
				if(item.split('=')[0].trim() == sessionkey)
					sessionid = item.split('=')[1];
			});
		}catch(e){
			console.error(e);
		}
	}
	// console.log(' out sessionid ',sessionid)
	return sessionid;
};

sessionmiddle.middle = function(req, res,next){
	// console.log('req.session',req.session)
	// console.log("Cookies: ", req.get('cookie'));
	let sessionid = sessionmiddle.getSessionId(req.get('cookie'),sessionmiddle.sessionName());
	if(!sessionid){
		sessionid = sessionmiddle.newSessionId();
		res.cookie(sessionmiddle.sessionName(),sessionid);
		
	}
	 new session(sessionid,redisclient,function(session){
	 	req.session = session;
		next();
	});
	
};


let session = function(sessionid,redisclient,cb){
	let _session = {};
	let me = this;
	sessionid = '_session'+sessionid;
	this.get = function(){
		return _session;
	}

	this.update = function(){
		if(!_session)
			return;
		redisclient.set(sessionid,JSON.stringify(_session),function(err){
			if(err)
				console.error('session update error ',err);
			me.expire();
		});
	};

	this.expire = function(expiretimespan){
		if(!expiretimespan)
			expiretimespan = 18e2;
		redisclient.connect(function(client){
			client.expire(sessionid, expiretimespan);
		});
	};

	this.clear = function(cb){
		redisclient.connect(function(client){
			client.del(sessionid,function(err, response){
				if (response == 1) {
			      console.log("Deleted Successfully!")
			   } else{
			    console.log("Cannot delete")
			   }
			   if(cb)
			   	cb(err,response);
			});
		});
	}

	function getSessionValuefRedis(sessionid,cb){
		// console.log('sessionid',sessionid);
		redisclient.get(sessionid,function(err,value){ 
			if(err)
				return console.error('session get error ',err);
			// console.log('value',value);
			if(value)
				_session = JSON.parse(value);
			else
				_session = {};
			// console.log(value,_session);
			if(cb)
				cb(me);
		});
		me.expire();
	}

	getSessionValuefRedis(sessionid,cb);

};



module.exports = sessionmiddle;