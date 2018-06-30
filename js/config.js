"use strict";

var config = {
	chainId: 1,
	apiPrefix: "https://mainnet.nebulas.io", //https://testnet.nebulas.io  https://mainnet.nebulas.io
	contractAddr: "n1h3JymSnNR5H2a32zNVuAfmzcdht8Q4JgR", //main n1zsohpv63CnmUs7aeVBfgeQBozpK5bmTMk test n21iah7tXxgxTZ6R81n9UuWGwULcuVansBd
	myAddress: "n1JeDTMq5xHq6Y16yApYbMdT4Vw4K9kzbK9",
	gaslimit: 2000000,
	gasprice: 1000000,
	addJoke: "addJoke",
	getAll: "getAll",
	comment: "comment", //添加评论
	reward: "reward",
	getJokeInfo: "getJokeInfo",
	personal: "personal",
	search: "search",
	getShareList: "getShareList",
	getSelfShareList: "getSelfShareList",
	checkTxhash: "https://explorer.nebulas.io/#/tx/"
};
var nebulas = require("nebulas"),
	neb = new nebulas.Neb(),
	api = neb.api,
	nonce = 0;
neb.setRequest(new nebulas.HttpRequest(config.apiPrefix));
var NebPay = require("nebpay");
var nebPay = new NebPay();
var serialNumber;
var defaultOptions = {
	goods: { //Dapp端对当前交易商品的描述信息，app暂时不展示
		name: "", //商品名称
		desc: "", //描述信息
		orderId: "", //订单ID
		ext: "" //扩展字段
	},
	qrcode: {
		showQRCode: false, //是否显示二维码信息
		container: undefined //指定显示二维码的canvas容器，不指定则生成一个默认canvas
	},
	// callback 是记录交易返回信息的交易查询服务器地址，不指定则使用默认地址
	callback: undefined,
	// listener: 指定一个listener函数来处理交易返回信息（仅用于浏览器插件，App钱包不支持listener）
	listener: undefined,
	// if use nrc20pay ,should input nrc20 params like name, address, symbol, decimals
	nrc20: undefined
};

function query(curWallet, method, args, callback) {
	if (typeof method != "undefined") {
		try {
			neb.setRequest(new nebulas.HttpRequest(config.apiPrefix));
			neb.api.getAccountState(curWallet).then(function(resp) {
				nonce = parseInt(resp.nonce || 0) + 1;
				neb.api.call({
					from: curWallet,
					to: config.contractAddr,
					value: 0,
					nonce: nonce,
					gasPrice: config.gasprice,
					gasLimit: config.gaslimit,
					contract: {
						"function": method,
						"args": args
					}
				}).then(function(resp) {
					callback(resp);
				}).catch(function(err) {
					callback(err);
					console.log(err);
				});
			}).catch(function(e) {
				callback(e);
				console.log(e);
			});
		} catch (e) {
			callback(e);
		}
	}
}
Date.prototype.toLocaleString = function() {
	return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate() + " " + this.getHours() + ":" + this.getMinutes();
};

function tips(text, isok) {
	var modal = $('#myModal');
	$('#myModal').modal('show');
	modal.find('.modal-title').text('提示');
	if (isok) {
		modal.find('.modal-body').html('<div class="alert alert-success" role="alert">' + text + '</div>');
	} else {
		modal.find('.modal-body').html('<div class="alert alert-warning" role="alert">' + text + '</div>');
	}
	setTimeout(function() {
		$('#myModal').modal('hide');
	}, 10000);
}

function calcReward(profits) {
	var count = new BigNumber(0);
	$.each(profits, function(key, item) {
		count = count.plus(new BigNumber(item.value));
	});
	return count;
}

function getTimeStr(date) {
	var y = new Date(date * 1000).getFullYear();
	var m = new Date(date * 1000).getMonth() + 1
	var d = new Date(date * 1000).getDate();

	var h = new Date(date * 1000).getHours()
	var mm = new Date(date * 1000).getMinutes()
	return y + "-" + m + '-' + d + " " + h + ':' + mm
}

function getQueryString(name) {
	// 用该属性获取页面 URL 地址从问号 (?) 开始的 URL（查询部分）
	var url = window.location.search;
	// 正则筛选地址栏
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	// 匹配目标参数
	var result = url.substr(1).match(reg);
	//返回参数值
	return result ? decodeURIComponent(result[2]) : null;
}
//对象深拷贝
function _deepCopy(obj) {
	var objClone;
	if (obj.constructor == Object) {
		objClone = new obj.constructor();
	} else if (obj.constructor == Array && obj.length == 0) {
		objClone = [];
	} else {
		objClone = new obj.constructor(obj.valueOf());
	}
	for (var key in obj) {
		if (objClone[key] != obj[key]) {
			if (typeof(obj[key]) == 'object') {
				if (obj[key].constructor == Array && obj[key].length == 0) {
					objClone[key] = [];
				} else {
					if (obj[key] == null) {
						objClone[key] = null;
					} else {
						objClone[key] = _deepCopy(obj[key]);
					}
				}
			} else {
				objClone[key] = obj[key];
			}
		}
	}
	objClone.toString = obj.toString;
	objClone.valueOf = obj.valueOf;
	return objClone;
}
//判断两个时间戳是不是同一天
function isToday(str, str1) {
	if (new Date(str).toDateString() === new Date(str1).toDateString()) {
		//今天
		return true;
	} else {
		return false;
	}
}
var intervalQuery;
var serialNumber;