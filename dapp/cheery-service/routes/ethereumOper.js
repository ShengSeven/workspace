// 引入web库
var Web3 = require('web3');
// 使用WebSocket协议 连接节点
let web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
// 获取合约实例
var Crowdfunding = require('../build/contracts/Smartex_sol_Smartex.json');
const crowdFund = new web3.eth.Contract(
    Crowdfunding,
    '0x52B81F226AF99019e91f73F160F07a1923C857F0'
);
//  监听Join 加速事件
crowdFund.events.Join(function(error, event) {
    if (error) {
        console.log(error);
    }
    // 打印出交易hash 及区块号
    console.log("交易hash:" + event.transactionHash);
    console.log("区块高度:" + event.blockNumber);
    //   获得监听到的数据：
    console.log("参与地址:" + event.returnValues.user);
    console.log("参与金额:" + event.returnValues.price);
});
