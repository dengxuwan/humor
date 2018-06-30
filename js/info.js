template.defaults.imports.dateFormat = function(date) {
	return getTimeStr(date);
};

var curWallet = "";

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


//发表评论
function sendComment() {
	
	var content = $("#commentContent").val();
	if (content === '') {
		alert('必须填写评论内容！');
		return;
	}
	var args = [jokeInfoId, content];
	defaultOptions.listener = function(data) {
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
                                        queryJokeInfo(true);
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
}


var amount = 0;
//查询段子信息
function queryJokeInfo(onlyComment) {
	vue.openFullScreen();//打开等待提示
	console.log("准备获取段子详情，段子ID:" + jokeInfoId);
	var temp = [jokeInfoId];
	query(config.myAddress, config.getJokeInfo, JSON.stringify(temp), function(resp) {
		console.log(resp, "获取段子详情");
		var jokeInfo = JSON.parse(resp.result);
		if (!onlyComment) {
			$("#title").html(jokeInfo.title);
			$("#author").html("作者:" + jokeInfo.author);
			$("#time").html("时间:" + getTimeStr(jokeInfo.time));
			$("#content").html(jokeInfo.content);
			amount = jokeInfo.amount;
			$("#amount").html("赏金: " + amount + "Nas");
			var picsDiv = $("#picsDiv");
			var pic = $("#pic");
			picsDiv.html(); //先清空之前的
			$.each(jokeInfo.pics, function(index, element) {
				var clone = pic.clone();
				clone.find("img").attr("src", element);
				picsDiv.append(clone);
			})
		}
		$("#praiseCount").html("评论人数: " + jokeInfo.comments.length + "人");
		var respData = {}
		respData.list = jokeInfo.comments
		var html = template('list', respData);
		document.getElementById('comments_ul').innerHTML = html;
		vue.loading.close();
	});
}

//打赏
function reward() {
	
	var args = [jokeInfoId];
	defaultOptions.listener = function(data) {
		$(".dialog").hide(200)
		if (data.txhash) {
                vue.$notify({
                      message: "打赏数据需要15秒时间写入区块链,是否成功请耐心等待系统自动通知！",
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
                                        queryJokeInfo(true);
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

var jokeInfoId = "";
$(function() {
	//获取参数
	jokeInfoId = getQueryString("jokeInfoId");
	if (!jokeInfoId || jokeInfoId === '') {
		alert('参数有误!');
		return;
	}
	getWallectInfo(); //获取钱包地址
	//获取段子详情
	queryJokeInfo(false);

})

function toIndexSearch() {
	var keyword = $("#keyword").val();
	window.location.href = "index.html?keyword=" + keyword;
}