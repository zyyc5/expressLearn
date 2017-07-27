$.fn.outerHtml = function(){  return $("<div></div>").append(this.clone()).html(); };
var IE = (function () {
    "use strict";
    var ret, isTheBrowser,
        actualVersion,
        jscriptMap, jscriptVersion;
    isTheBrowser = false;
    jscriptMap = {
        "5.5": "5.5",
        "5.6": "6",
        "5.7": "7",
        "5.8": "8",
        "9": "9",
        "10": "10",
        "11": "11"
    };
    jscriptVersion = new Function("/*@cc_on return @_jscript_version; @*/")();
    if (jscriptVersion !== undefined) {
        isTheBrowser = true;
        actualVersion = jscriptMap[jscriptVersion];
    }
    ret = {
        isTheBrowser: isTheBrowser,
        actualVersion: actualVersion
    };
    return ret;
}());
var OrderNotificationView = [];
$(document.body).ready(function(){
	OrderNotificationView.push(new MenuBubbleView());
//    OrderNotificationView.push(new AutoCheckOrderView());
	$(".bf-sidenav").find("li").removeClass("active");
	$(".bf-sidenav").find("li > a").each(function(){
		if(this.href.indexOf(window.location.pathname) != -1){
			$(this.parentNode).addClass("active");
			return false;
		}
	});
	$(".mainNav").find("li").removeClass("active");
	$(".mainNav").find("li > a").each(function(){
		if(window.location.pathname.length > 1 && this.href.indexOf(window.location.pathname) != -1){
			$(this.parentNode).addClass("active").removeClass("default");
			return false;
		}
	});
	if(window.location.pathname.indexOf("/platform") != -1){
		if(typeof(mainMenu) == 'undefined'){
			mainMenu = 'platform';
		}
		$("li."+mainMenu).addClass("info");
	}
	$('<div id="resultMsg" style="display:none;"></div>').appendTo("body");
	$(".bodyWrapper").css("min-height", ($(window).height() - $(".topNavbar").height()  - $(".bf-footer").height() - "100") + "px");
    $(".bodyWrapper").css("margin-top", "20px");
    if(typeof(CURRENT_LOGGED_MERCHANT) != 'undefined'){
		if(IE.isTheBrowser && parseInt(IE.actualVersion) < 10){
			window.location = "/browser";
			return;
		}
		var host = window.location.host.split(':')[0];
//		var socket = io.connect('http://' + host);
//		// send join message
//		socket.emit('join', JSON.stringify({ user: CURRENT_LOGGED_MERCHANT.name }));
//		socket.on('new_order', function (msg) {
//			var message = JSON.parse(msg);
//			if(message.action == "message"){
//				var msg = message.msg.split(";");
//				if(msg[0] == CURRENT_LOGGED_MERCHANT.id){
//					var order = JSON.parse(msg[1]);
//					for(var idx in OrderNotificationView){
//						var onv = OrderNotificationView[idx];
//						if(onv != null && typeof(onv.doUpdate) == 'function'){
//							onv.doUpdate(order);
//						}
//					}
//				}
//			}
//		});
	}
	/*
	$('[data-toggle="confirmation"]').confirmation({
		placement: "right",
		title: "您确认吗？",
		btnOkLabel: "是的",
		btnCancelLabel: "不了",
	});
	*/
});

$.ajaxSetup({
	cache: false,
	beforeSend: function(xmlhttp, req){
		if(req.type.toLowerCase() == "get"){
			$("#loadingIcon").show();
		}
	},
	complete: function(){
		$("#loadingIcon").hide();
	}
});

function MenuBubbleView(){
	this.doUpdate = function(order){
		var menuBubbleSpan = $("#"+order.type+"MenuBubble");
		menuBubbleSpan.html(parseInt(menuBubbleSpan.html()) + 1);
		menuBubbleSpan.removeClass("hide");
		playmusic();
	};
};

function AutoCheckOrderView() {
    this.doUpdate = function(order){
        if(typeof(autoCheckOrderFlag) != 'undefined' && autoCheckOrderFlag.toLowerCase() == 'yes' ){
            if(typeof(updateTakeoutOrder) == 'function'){
                updateTakeoutOrder(order.id, 2 ,false, false);
            }
        }
    };
}

function playmusic() {
	document.getElementById("swxOrderNotice").play();
};
