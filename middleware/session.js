const uuidv4 = require('uuid/v4');
var sessionmiddle = {};
const util = require('../src/util');
const SessionExpire = 3600;
const tokenExpire = 3600;

sessionmiddle.newSessionId = function () {
	return uuidv4();
};

sessionmiddle.sessionName = function () {
	return '_node_session';
};

sessionmiddle.getSessionId = function (cookeie, sessionkey) {
	// console.log(' in cookeie ',cookeie,sessionkey)
	let sessionid = null;
	if (cookeie && cookeie.length > 0) {
		// debugger;
		try {
			let cookeies = cookeie.split(';');
			cookeies.forEach(function (item) {
				if (item.split('=')[0].trim() == sessionkey)
					sessionid = item.split('=')[1];
			});
		} catch (e) {
			console.error(e);
		}
	}
	// console.log(' out sessionid ',sessionid)
	return sessionid;
};

sessionmiddle.middle = function (req, res, next) {
	// console.log('req.session',req.session)
	// console.log("Cookies: ", req.get('cookie'));
	let token = req.method == "GET" ? req.query.token : req.body.token; //支持token方式
	let sessionid = token || (sessionmiddle.getSessionId(req.get('cookie'), sessionmiddle.sessionName()));
	if (!sessionid) {
		sessionid = sessionmiddle.newSessionId();
		res.cookie(sessionmiddle.sessionName(), sessionid, {
			httpOnly: true
		}); //maxAge: 900000,
	}
	new session(sessionid, !!token, function (session) {
		req.session = session;
		next();
	});

};


let session = function (sessionid, isToken, cb) {
	let _session = {};
	let me = this;
	sessionid = '_session' + sessionid;
	this.get = function () {
		return _session;
	}

	this.update = function (expiretimespan) {
		if (!_session)
			return;
		if (!expiretimespan)
			expiretimespan = isToken ? tokenExpire : SessionExpire;
		util.redis.putValue({
			key: sessionid,
			value: JSON.stringify(_session),
			seconds: expiretimespan
		}).then((err) => {
			// if(err&&err!='OK')
			// 	console.error('session update error ',err);
		})
	};

	this.expire = function (expiretimespan) {
		if (!expiretimespan)
			expiretimespan = isToken ? tokenExpire : SessionExpire;
		util.redis.exec({
			cmd: 'expire',
			argv: [sessionid, expiretimespan],
			dbIndex: 0
		});
	};

	this.clear = function (cb) {
		util.redis.delKey({
			key: sessionid
		}).then((err, response) => {
			if (err && err != 'OK')
				console.log("Cannot delete")
			if (cb)
				cb(err, response);
		});
	}

	this.newSession = (sessionId) => {
		sessionid = '_session' + sessionId;
	}

	function getSessionValuefRedis(sessionid, cb) {
		util.redis.getKeyAndTtl({
			key: sessionid
		}).then(({
			ttl,
			value
		}) => {
			if (value)
				_session = JSON.parse(value);
			else
				_session = {};
			// console.log(value,_session);
			if (cb)
				cb(me);
			if (!ttl > -1)
				me.expire();
		})
	}

	getSessionValuefRedis(sessionid, cb);

};



module.exports = sessionmiddle;