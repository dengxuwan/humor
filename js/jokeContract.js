'use strict';
//评论对象
var Comment = function(obj) {
	if (typeof obj === "string") {
		obj = JSON.parse(obj);
	}
	if (typeof obj === "object") {
		this.id = obj.id;
		this.user = obj.user;
		this.time = obj.time;
		this.content = obj.content;
	} else {
		this.id = "";
		this.user = "";
		this.time = "";
		this.content = "";
	}
};
Comment.prototype = {
	toString: function() {
		return JSON.stringify(this);
	}
};
//音乐对象
var JokeInfo = function(obj) {
	if (typeof obj === "string") {
		obj = JSON.parse(obj);
	}
	if (typeof obj === "object") {
		this.title = obj.title;
		this.author = obj.author;
		this.time = obj.time;
		this.content = obj.content;
		this.pics = obj.pics; // 图片URL
		this.comments = obj.comments; // 评论列表
		this.rewards = obj.rewards; // 打赏列表 
	} else {
		this.title = "";
		this.author = "";
		this.time = "";
		this.content = "";
		this.pics = []; // 图片URL
		this.comments = []; // 评论列表
		this.rewards = []; // 打赏列表 
	}
};
JokeInfo.prototype = {
	toString: function() {
		return JSON.stringify(this);
	},
	//添加评论记录
	addComment: function(comment) {
		if (this.comments == null) {
			this.comments = [];
		}
		if (typeof comment != "undefined") {
			this.comments.push(comment);
		}
	},
	// 增加打赏记录
	addReward: function(rewardInfo) {
		if (this.rewards == null) {
			this.rewards = [];
		}
		if (typeof rewardInfo != "undefined") {
			this.rewards.push(rewardInfo);
		}
	}
};
//打赏记录
var RewardInfo = function(obj) {
	if (typeof obj === "string") {
		obj = JSON.parse(obj);
	}
	if (typeof obj === "object") {
		this.from = obj.from; // 打赏人地址
		this.to = obj.to; // 被打赏人地址
		this.amount = obj.amount; //打赏金额
		this.time = obj.time; //打赏时间
	} else {
		this.from = ""; // 打赏人地址
		this.to = "";
		this.amount = new BigNumber(0); //打赏金额
		this.time = ""; //打赏时间
	}
}
RewardInfo.prototype = {
	toString: function() {
		return JSON.stringify(this);
	}
};

var JokeContract = function() {
	// 定义全局变量
	LocalContractStorage.defineProperties(this, {
		_currentUser: "", // 当前使用人地址
		_fee: new BigNumber(0.01),
		_wei: 1000000000000000000,
		_jSize: 0
	});
	// 定义全局的map变量
	LocalContractStorage.defineMapProperties(this, {
		"jokeInfos": {
			parse: function(value) {
				return new JokeInfo(value);
			},
			stringify: function(o) {
				return o.toString();
			}
		},
		"JokeInfoKeys": {
			parse: function(value) {
				return value.toString();
			},
			stringify: function(o) {
				return o.toString();
			}
		}
	});
};
JokeContract.prototype = {
	init: function() {
		this._currentUser = Blockchain.transaction.from;
		this._fee = new BigNumber(0.01); // 手续费
		this._wei = 1000000000000000000; // 单位
		this._jSize = 0;
		var key = this._currentUser + Blockchain.transaction.timestamp.toString(10);
		var jokeInfo = new JokeInfo({
			title: '和网恋女友终于奔现了…',
			author: this._currentUser,
			content: '',
			time: Blockchain.transaction.timestamp.toString(10),
			rewards: [],
			comments: [],
			pics: ['https://wx1.sinaimg.cn/mw690/6f57a017gy1frtbxhjo3zg20ah0e3qve.gif']
		});
		this.JokeInfoKeys.set(this._jSize, key);
		this.jokeInfos.set(key, jokeInfo);
		this._jSize++;
		key = "222";
		var jokeInfo1 = new JokeInfo({
			title: '不关我的事，拜拜！',
			author: this._currentUser,
			content: '',
			time: Blockchain.transaction.timestamp.toString(10),
			rewards: [],
			comments: [],
			pics: ['https://wx2.sinaimg.cn/large/7d2e855dgy1frun6rrcf1g208w05inpd.gif']
		});
		this.JokeInfoKeys.set(this._jSize, key);
		this.jokeInfos.set(key, jokeInfo1);
		this._jSize++;
	},
	//智能合约中验证地址正确性
	_verifyAddress: function(address) {
		// 1-valid, 0-invalid
		var result = Blockchain.verifyAddress(address);
		return {
			valid: result == 0 ? false : true
		};
	},
	currentUser: function() {
		return this._currentUser;
	},

	resetCurrentUser: function(addr) {
		if (this._currentUser === Blockchain.transaction.from && this.verifyAddress(addr)) {
			this._currentUser = addr;
		} else {
			return 'Permission denied!';
		}
	},

	wei: function() {
		return this._wei;
	},

	resetWei: function(wei) {
		if (this._creator === Blockchain.transaction.from) {
			this._wei = wei;
		} else {
			return 'Permission denied!';
		}
	},

	fee: function() {
		return this._fee;
	},

	resetFee: function(value) {
		if (this._creator === Blockchain.transaction.from) {
			this._fee = new BigNumber(value);
		} else {
			return 'Permission denied!';
		}
	},
	//对象深拷贝
	_deepCopy: function(obj) {
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
							objClone[key] = this._deepCopy(obj[key]);
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
	},
	// 查询所有列表
	getAll: function() {
		var list = [];
		for (var i = 0; i < this._jSize; i++) {
			var key = this.JokeInfoKeys.get(i);
			var jokeInfo = this.jokeInfos.get(key);
			jokeInfo['amount'] = this._getTotalAmount(jokeInfo.rewards);
			jokeInfo['id'] = key;
			list.push(jokeInfo);
		}
		list = list.reverse(); //反转
		return list;
	},
	//分页获取段子列表
	getListByPage: function(pageNo, pageSize) {
		var list = this.getAll();
		if (pageNo === 0) {
			return list;
		}
		if (list.length < pageSize) {
			return list;
		}
		var limit = pageNo * pageSize;
	},
	//打赏作者
	reward: function(jokeInfoId) {
		var from = Blockchain.transaction.from;
		var time = Blockchain.transaction.timestamp.toString(10);
		var value = Blockchain.transaction.value.div(this._wei);
		var jokeInfo = this.jokeInfos.get(jokeInfoId);
		if (!jokeInfo) {
			throw new Error("没有找到此段子信息!");
		}
		var amount = new BigNumber(value).mul(this._wei);
		var result = Blockchain.transfer(jokeInfo.author, amount);
		if (!result) {
			throw new Error("transfer failed.");
		}
		//增加打赏记录
		var reward = new RewardInfo({
			id: from + time.toString,
			from: from,
			to: jokeInfo.author,
			amount: value,
			time: time
		});
		jokeInfo.addReward(reward);
		this.jokeInfos.set(jokeInfoId, jokeInfo);
		return "success";
	},
	//添加评论
	comment: function(jokeInfoId, content) {
		var from = Blockchain.transaction.from;
		var time = Blockchain.transaction.timestamp.toString(10);
		var id = from + time;
		var jokeInfo = this.jokeInfos.get(jokeInfoId);
		if (!jokeInfo) {
			throw new Error("没有找到此段子信息!");
		}
		var comment = new Comment({
			id: id,
			user: from,
			content: content,
			time: time
		});
		jokeInfo.addComment(comment);
		this.jokeInfos.set(jokeInfoId, jokeInfo);
	},
	//编辑段子
	editJoke: function(jokeInfoId, args) {
		var arg = JSON.parse(args);
		var from = Blockchain.transaction.from;
		var time = Blockchain.transaction.timestamp.toString();
		var id = from + time;
		var jokeInfo = this.jokeInfos.get(jokeInfoId);
		if (!jokeInfo) {
			throw new Error("没有找到此段子信息!");
		}
		if (jokeInfo.author !== from) {
			throw new Error("你没有权限编辑此段子!");
		}
		jokeInfo.title = arg.title;
		jokeInfo.content = arg.content;
		this.jokeInfos.set(jokeInfoId, jokeInfo);
		return "succes";
	},
	//删除段子
	deleteJoke: function(jokeInfoId) {
		var arg = new JokeInfo(args);
		var from = Blockchain.transaction.from;
		var time = Blockchain.transaction.timestamp.toString(10);
		var id = from + time;
		var jokeInfo = this.jokeInfos.get(jokeInfoId);
		if (!jokeInfo) {
			throw new Error("没有找到此段子信息!");
		}
		if (jokeInfo.author !== from) {
			throw new Error("你没有权限编辑此段子!");
		}
		this.jokeInfos.del(jokeInfoId);
		return "succes";
	},
	//添加段子
	addJoke: function(title, content, picStr) {
		var from = Blockchain.transaction.from;
		var time = Blockchain.transaction.timestamp.toString(10);
		var pics = [];
		if (picStr && picStr !== "") {
			if (picStr.indexOf(",") !== -1) {
				pics = picStr.split(",");
			} else {
				pics.push(picStr);
			}
		}
		var jokeInfo = new JokeInfo({
			id: from + time,
			author: from,
			title: title,
			content: content,
			pics: pics,
			time: time,
			comments: [],
			rewards: []
		});
		console.info(jokeInfo);
		this.jokeInfos.set(from + time, jokeInfo);
		this.JokeInfoKeys.set(this._jSize, from + time);
		this._jSize++;
	},
	// 查询自己发布的列表
	_getMyList: function() {
		var from = Blockchain.transaction.from;
		var list = [];
		for (var i = 0; i < this._jSize; i++) {
			var key = this.JokeInfoKeys.get(i);
			var jokeInfo = this.jokeInfos.get(key);
			if (jokeInfo.author === from) {
				jokeInfo['amount'] = this._getTotalAmount(jokeInfo.rewards);
				jokeInfo['id'] = key;
				list.push(jokeInfo);
			}
		}
		return list.reverse();
	},
	//查看自己的赏金记录
	_getRewardList: function() {
		var from = Blockchain.transaction.from;
		var list = [];
		for (var i = 0; i < this._jSize; i++) {
			var key = this.JokeInfoKeys.get(i);
			var jokeInfo = this.jokeInfos.get(key);
			for (var j = 0; j < jokeInfo.rewards.length; j++) {
				var rewardInfo = jokeInfo.rewards[j];
				if (rewardInfo.to === from) {
					list.push({
						id: key,
						title: jokeInfo.title,
						from: rewardInfo.from,
						amount: rewardInfo.amount,
						time: rewardInfo.time
					});
				}
			}
		}
		return list.reverse();
	},
	//查看自己的评论记录
	_getCommentList: function() {
		var from = Blockchain.transaction.from;
		var list = [];
		for (var i = 0; i < this._jSize; i++) {
			var key = this.JokeInfoKeys.get(i);
			var jokeInfo = this.jokeInfos.get(key);
			for (var j = 0; j < jokeInfo.comments.length; j++) {
				var comment = jokeInfo.comments[j];
				if (comment.user === from) {
					list.push({
						id: key,
						title: jokeInfo.title,
						content: comment.content,
						time: comment.time
					});
				}
			}
		}
		return list.reverse();
	},
	// 个人主页需要的数据
	personal: function() {
		var from = Blockchain.transaction.from;
		var result = {};
		var comments = this._getCommentList();
		var rewards = this._getRewardList();
		var jokeInfos = this._getMyList();
		result["comments"] = comments;
		result["rewards"] = rewards;
		result["jokeInfos"] = jokeInfos;
		return result;
	},
	_getTotalAmount: function(rewards) {
		var amount = new BigNumber(0);
		for (var i = 0; i < rewards.length; i++) {
			amount = amount.plus(rewards[i].amount);
		}
		return amount;
	},
	//获取段子详情
	getJokeInfo: function(jokeInfoId) {
		var jokeInfo = this.jokeInfos.get(jokeInfoId);
		if (!jokeInfo) {
			throw new Error('此段子不存在!');
		}
		jokeInfo['id'] = jokeInfoId;
		jokeInfo['amount'] = this._getTotalAmount(jokeInfo.rewards);
		return jokeInfo;
	},
	//获取当前时间格式：20180530
	_getCurrentDate: function() {
		var y = new Date().getFullYear();
		var m = new Date().getMonth() + 1;
		var d = new Date().getDate();
		var time = y + m + d;
		return time;
	},
	//按标题搜索
	search: function(keyWord) {
		var reg = new RegExp(keyWord);
		var list = [];
		for (var i = 0; i < this._jSize; i++) {
			var key = this.JokeInfoKeys.get(i);
			var jokeInfo = this.jokeInfos.get(key);
			if (jokeInfo.title.match(reg) || jokeInfo.content.match(reg)) {
				jokeInfo['amount'] = this._getTotalAmount(jokeInfo.rewards);
				jokeInfo['id'] = key;
				list.push(jokeInfo);
			}
		}
		return list;
	}
};
module.exports = JokeContract;