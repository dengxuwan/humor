var vue = new Vue({
      el: '#app',
      created: function() {
            if (!window.webExtensionWallet) {
                  this.$notify({
                        showClose: true,
                        duration: 5000,
                        message: '温馨提示:使用本站所有功能请安装钱包插件，否则将无法正常使用本站功能！',
                        type: 'warning',
                        offset: 100
                  });
            }
      },
      mounted: function() {

      },
      updated: function() {},


      data() {
            return {
                  tempVar: true,
                  allList: [], //所有段子列表
                  cloneList: [],
                  labelWidth: '100px', //表单左边label文字宽度
                  curWallet: "", //钱包地址
                  allListLoading: true,
                  dialogVisible: false,
                  clickRow: {}, //点击的行对象
                  tabPosition: 'left',
                  timer: {},
                  serialNumber: '',
                  // 要展开的行，数值的元素是row的key值
                  expands: [],
                  fullscreenLoading:false,
                  loading:{}
            }
      },
      filters: {
            getDateTimeStr: function(v) {
                  var value = Number(v);
                  var y = new Date(value).getFullYear();
                  var m = new Date(value).getMonth() + 1
                  var d = new Date(value).getDate();

                  var h = new Date(value).getHours()
                  var mm = new Date(value).getMinutes()

                  if (m < 10) {
                        m = '0' + m;
                  }
                  if (d < 10) {
                        d = '0' + d;
                  }
                  if (mm < 10) {
                        mm = '0' + mm;
                  }
                  if (h < 10) {
                        h = '0' + h;
                  }
                  var result = y + "-" + m + '-' + d + " " + h + ':' + mm;
                  return result;
            }
      },

      methods: {
            openFullScreen:function(){
                vue.loading = vue.$loading({
                  lock: true,
                  text: 'Loading',
                });
            },
            tableRowClassName: function({
                  row,
                  rowIndex
            }) {
                  if (rowIndex % 2 === 0) {
                        return 'success-row';
                  } else if (rowIndex % 2 != 0) {
                        return '';
                  }

            },
            //发布评论
            toComment: function() {
                  
            },
            //获取钱包地址
            getWallectInfo: function() {
                  window.postMessage({
                        "target": "contentscript",
                        "data": {},
                        "method": "getAccount",
                  }, "*");
                  window.addEventListener('message', function(e) {
                        if (e.data && e.data.data) {
                              if (e.data.data.account) {
                                    vue.curWallet = e.data.data.account;
                                    // vue.getAll();
                              }
                        }
                  });
            },
            //获取所有活动列表
            getAll: function() {
                  this.allListLoading = true;
                  query(config.myAddress, config.getAll, "", function(resp) {
                        console.log(resp, "查询所有段子列表");
                        var respArr = JSON.parse(resp.result);
                        vue.allList = vue.handleList(respArr);
                        vue.cloneList = vue.allList;
                        console.log(vue.allList, "查询所有段子列表");
                        vue.allListLoading = false;
                        vue.tempVar = false;
                  });
            },
            funcIntervalQuery: function() {
                  var defaultOptions = {
                        callback: "https://pay.nebulas.io/api/mainnet/pay"
                  }
                  nebPay.queryPayInfo(vue.serialNumber, defaultOptions) //search transaction result from server (result upload to server by app)
                        .then(function(resp) {
                              var respObject = JSON.parse(resp)
                              console.log(respObject, "获取交易状态返回对象") //resp is a JSON string
                              if (respObject.code === 0 && respObject.data.status === 1) { //说明成功写入区块链
                                    vue.getAll();
                                    //关闭定时任务
                                    clearInterval(intervalQuery)
                              }
                        })
                        .catch(function(err) {
                              console.log(err);
                        });
            },
      }
});