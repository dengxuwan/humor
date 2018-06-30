template.defaults.imports.dateFormat = function(date) {
	return getTimeStr(date);
};



var curWallet = "";

//获取钱包地址
function getWallectInfo() {
	window.postMessage({
		"target": "contentscript",
		"data": {},
		"method": "getAccount",
	}, "*");
	window.addEventListener('message', function(e) {
		if (e.data && e.data.data) {
			if (e.data.data.account) {
				curWallet = e.data.data.account;
			}
		}
	});
}

function getJokeInfoList(address) {
	vue.openFullScreen();
	//获取段子列表
	query(address, config.getAll, "", function(resp) {
		var respArr = JSON.parse(resp.result)
		console.log(respArr, "智能合约获取列表");
		initJokeList(respArr);
		initDateInfo(respArr);
		//对列表按照评论人数进行排序
		var commentList = SortByCommentNum(respArr);
		var respData = {}
		respData.list = commentList
		var html = template('hotScript', respData);
		document.getElementById('hotUl').innerHTML = html;
		vue.loading.close();
	});
}

function initJokeList(respArr) {
	var respData = {}
	respData.list = respArr
	var html = template('list', respData);
	document.getElementById('content-box').innerHTML = html;
}
//投稿
function addJokeInfo() {
	//这里需要判断是否填写了必填项目
	var title = $("#joke_title").val();
	var content = $("#joke_content").val();
	var joke_pics = $(".sendbox");
	var pics = "";
	if (joke_pics.find(".imgAddress").length >= 1) {
		for (var i = 0; i < joke_pics.find(".imgAddress").length; i++) {
			pics += joke_pics.find(".imgAddress").eq(i).find(".joke_pic").val();
			if (i !== joke_pics.find(".imgAddress").length - 1) {
				pics += ",";
			}
		}

	}
	if (title === '' || pics === '') {
		vue.$notify({
            showClose: true,
            duration: 5000,
            message: '标准和图片链接不能为空！',
            type: 'warning',
            offset: 100
         });
		return;
	}
	var args = [title, content, pics];
	console.log(JSON.stringify(args), '投稿参数');
	defaultOptions.listener = function(data) {
		$(".dialog").hide(100)
		if (data.txhash) {
                vue.$notify({
                      message: "投稿数据需要15秒时间写入区块链,是否成功请耐心等待系统自动通知！",
                      duration: 20000,
                      showClose: true,
                      type: "warning",
                      offset: 150
                });
                var neburl = "https://mainnet.nebulas.io";
                var txhash = data.txhash;
                intervalQuery = setInterval(() => {
                      console.log('wait......');
                      axios.post(neburl + "/v1/user/getTransactionReceipt", {
                                  hash: txhash
                            })
                            .then(d => {
                                  if (d.data && d.data.result.execute_result !== "") {
                                        vue.$confirm('投稿数据已经成功写入区块链,是否刷新列表?', '成功', {
                                              confirmButtonText: '刷新',
                                              cancelButtonText: '取消',
                                              type: 'success'
                                        }).then(() => {
                                              getJokeInfoList(config.myAddress);
                                        }).catch(() => {
                                              
                                        });
                                        // success
                                        clearInterval(intervalQuery);
                                  } else if (d.data.result.status === 0) {
                                        vue.$notify({
                                              message: "投稿失败，有可能是您的余额不足!",
                                              duration: 0,
                                              showClose: true,
                                              type: "error",
                                              offset: 150
                                        });
                                        clearInterval(intervalQuery);
                                  }
                            });
                }, 6000);
          } else {
                vue.$notify({
                      message: "交易已经取消！",
                      duration: 5000,
                      showClose: true,
                      type: "info",
                      offset: 150
                });
          }
	};
	serialNumber = nebPay.call(config.contractAddr, "0", config.addJoke, JSON.stringify(args), defaultOptions);
}

//发表评论
function sendComment() {
	if (curWallet === '') {
		alert("评论段子必须安装星云钱包插件！");
		return;
	}
	var content = $("#commentContent").val();
	if (content === '') {
		alert('必须填写评论内容！');
		return;
	}
	var args = [clickJokeId, content];
	defaultOptions.listener = function(data) {
		$(".dialog").hide(100)
		if (data.txhash) {
                vue.$notify({
                      message: "评论数据需要15秒时间写入区块链,是否成功请耐心等待系统自动通知！",
                      duration: 20000,
                      showClose: true,
                      type: "warning",
                      offset: 150
                });
                var neburl = "https://mainnet.nebulas.io";
                var txhash = data.txhash;
                intervalQuery = setInterval(() => {
                      console.log('wait......');
                      axios.post(neburl + "/v1/user/getTransactionReceipt", {
                                  hash: txhash
                            })
                            .then(d => {
                                  if (d.data && d.data.result.execute_result !== "") {
                                  		vue.$notify({
                                              message: "评论数据已经成功写入区块链!",
                                              duration: 0,
                                              showClose: true,
                                              type: "success",
                                              offset: 150
                                        });   
                                        // success
                                        clearInterval(intervalQuery);
                                  } else if (d.data.result.status === 0) {
                                        vue.$notify({
                                              message: "评论失败，有可能是您的余额不足!",
                                              duration: 0,
                                              showClose: true,
                                              type: "error",
                                              offset: 150
                                        });
                                        clearInterval(intervalQuery);
                                  }
                            });
                }, 6000);
          } else {
                vue.$notify({
                      message: "交易已经取消！",
                      duration: 5000,
                      showClose: true,
                      type: "info",
                      offset: 150
                });
          }
	};
	serialNumber = nebPay.call(config.contractAddr, "0", config.comment, JSON.stringify(args), defaultOptions);
	console.log("交易号为" + serialNumber, "发表评论交易hash")
}

//打赏
function reward() {
	if (curWallet === '') {
		alert("打赏作者必须安装星云钱包插件！");
		return;
	}
	if (clickAmount === '' || clickAmount === '0') {
		alert('请选择打赏金额');
		return
	}
	var args = [clickJokeId];
	defaultOptions.listener = function(data) {
		$(".dialog").hide(100)
		if (data.txhash) {
                vue.$notify({
                      message: "数据需要15秒时间写入区块链,是否成功请耐心等待系统自动通知！",
                      duration: 20000,
                      showClose: true,
                      type: "warning",
                      offset: 150
                });
                var neburl = "https://mainnet.nebulas.io";
                var txhash = data.txhash;
                intervalQuery = setInterval(() => {
                      console.log('wait......');
                      axios.post(neburl + "/v1/user/getTransactionReceipt", {
                                  hash: txhash
                            })
                            .then(d => {
                                  if (d.data && d.data.result.execute_result !== "") {
                                  		vue.$notify({
                                              message: "打赏数据已经成功写入区块链!",
                                              duration: 0,
                                              showClose: true,
                                              type: "success",
                                              offset: 150
                                        });   
                                        // success
                                        clearInterval(intervalQuery);
                                  } else if (d.data.result.status === 0) {
                                        vue.$notify({
                                              message: "打赏失败，有可能是您的余额不足!",
                                              duration: 0,
                                              showClose: true,
                                              type: "error",
                                              offset: 150
                                        });
                                        clearInterval(intervalQuery);
                                  }
                            });
                }, 6000);
          } else {
                vue.$notify({
                      message: "交易已经取消！",
                      duration: 5000,
                      showClose: true,
                      type: "info",
                      offset: 150
                });
          }

	};
	serialNumber = nebPay.call(config.contractAddr, clickAmount + "", config.reward, JSON.stringify(args), defaultOptions);
}

function funcIntervalQuery() {
	nebPay.queryPayInfo(serialNumber, defaultOptions) //search transaction result from server (result upload to server by app)
		.then(function(resp) {
			var respObject = JSON.parse(resp)
			console.log(respObject, "获取交易状态返回对象") //resp is a JSON string
			if (respObject.code === 0 && respObject.data.status === 1) { //说明成功写入区块链
				getJokeInfoList(curWallet);
				//关闭定时任务
				clearInterval(intervalQuery)
			}
		})
		.catch(function(err) {
			console.log(err);
		});
}

function toSearch() {
	keyword = $("#keyword").val();
	search(keyword);

}

function search(keyword) {
	vue.openFullScreen(); //显示进度表加载数据
	if (!keyword || keyword === '') {
		//查询全部
		getJokeInfoList(config.myAddress);
	} else {
		//说明是关键字搜索
		$("#keyword").val(keyword);
		var temp = [keyword];
		query(config.myAddress, config.search, JSON.stringify(temp), function(resp) {
			console.log(resp, "搜索智能合约获取列表");
			var respArr = JSON.parse(resp.result)
			var respData = {}
			respData.list = respArr
			var html = template('list', respData);
			document.getElementById('content-box').innerHTML = html;
			vue.loading.close(); //隐藏进度表加载数据
		});
	}

}
//段子列表按照评论人数进行排序方法
function SortByCommentNum(JokeInfos) {
	return JokeInfos.sort(cCompare);
}
//段子列表按照评论人数进行排序方法
function SortByRewardAmount(JokeInfos) {
	return JokeInfos.sort(rCompare);
}
//段子列表按照评论人数进行排序方法
function cCompare(x, y) { //比较函数
	if (x.comments.length < y.comments.length) {
		return 1;
	} else if (x.comments.length > y.comments.length) {
		return -1;
	} else {
		return 0;
	}
}
//段子列表按照打赏金额进行排序
function rCompare(x, y) { //比较函数
	if (x.amount < y.amount) {
		return 1;
	} else if (x.amount > y.amount) {
		return -1;
	} else {
		return 0;
	}
}
//只筛选出指定日期的段子
function filterByDate(jokeInfos, DateStr) {
	var list = [];
	$.each(jokeInfos, function(index, element) {
		var time = jokeInfos.time;
		if (isToday(DateStr, time * 1000)) {
			list.push(element);
		}
	})
}

var todayNum = 0;

function initDateInfo(jokeInfos) {
	todayNum = 0;
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var myddy = date.getDay(); //获取存储当前日期
	var weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
	var weekday = weekdays[myddy];
	$('.year').html(year);
	$('.month').html(month);
	$('.day').html(day);
	$('.week').html(weekday);
	$.each(jokeInfos, function(index, element) {
		if (new Date(element.time * 1000).toDateString() === new Date().toDateString()) {
			todayNum++;
		}
	})
	$("#todayNum").html(todayNum);
}
var keyword;
$(function() {
	getWallectInfo();
	//获取参数
	
	keyword = getQueryString("keyword");
	if (!keyword || keyword === '') {
		getJokeInfoList(config.myAddress);
	} else {
		//说明是搜索
		$("#keyword").val(keyword);
		search(keyword);
	}

});
