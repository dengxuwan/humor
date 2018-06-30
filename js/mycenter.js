template.defaults.imports.dateFormat = function(date) {
	return getTimeStr(date);
};

var centerObject = {};
var curWallet;

function getWallectInfo() {

	window.postMessage({
		"target": "contentscript",
		"data": {},
		"method": "getAccount",
	}, "*");
	window.addEventListener('message', function(e) {
		if (e.data && e.data.data) {
			if (e.data.data.account && e.data.data.account !== '') {
				curWallet = e.data.data.account;
				queryCenterInfo();
			}
			if(!curWallet || curWallet === '') {
					$(".toptips").show();
					$(".loading").hide();
				} else {
					$(".toptips").hide();
			}
		} 
	});
}

function queryCenterInfo() {
	//获取个人信息列表;
	query(curWallet, config.personal, "", function(resp) {
		console.log(resp, "获取个人信息返回数据");
		centerObject = JSON.parse(resp.result);
		console.log(centerObject, "获取个人信息返回数据");
		var respData = {}
		respData.list = centerObject.jokeInfos;
		var html = template('jokeScript', respData);
		document.getElementById('jokeBody').innerHTML = html;

		respData.commentList = centerObject.comments;
		html = template('commentScript', respData);
		document.getElementById('commentBody').innerHTML = html;

		respData.rewardList = centerObject.rewards;
		html = template('rewardScript', respData);
		document.getElementById('rewardBody').innerHTML = html;
		$(".loading").hide();
	});
}


function toIndexSearch() {
	var keyword = $("#keyword").val();
	window.location.href = "index.html?keyword=" + keyword;
}
$(function(){
		$(".search-input input").on("focus",function(){
			$(".search").css({
				'width':'150px'
			})
		});
		$(".search-input input").on("blur",function(){
			$(".search").css({
				'width':'100px'
			})
		})
		$("#my-nav-li li").on('click', function(){
			var index= $(this).index();
			$(this).addClass('active').siblings().removeClass('active');
			$(".my-list").find("li").eq(index).show().siblings().hide();
		})
		// $(".loading").show();
		getWallectInfo(); //获取钱包地址并查询个人信息
	})