var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// app.listen(3002, () => console.log('Start Server, listening on port 3002!'));
//
// const ethers = require('ethers');
// var Web3 = require('web3');
//
// // The Contract interface
// var abi = require('./build/contracts/Smartex_sol_Smartex.json');
//
// // Connect to the network
// let provider = ethers.getDefaultProvider(3);
// // console.log(provider)
// let web3 = new Web3(provider);
// // console.log(web3)
// // console.log(web3.eth.accounts)
// // aaaFun();
// async function aaaFun(){
//
//     console.log('111');
//     var accounts = await web3.eth.getAccounts();
//     console.log(accounts);
//     console.log('222');
// }
//
// // 地址来自上面部署的合约 test ropsten
// let contractAddress = "0xfE2eebfb45755B55391f1c6fe020Ab0242E4FaE4";
// //
// // 使用Provider 连接合约，将只有对合约的可读权限
// let contract = new ethers.Contract(contractAddress, abi, provider);
// // console.log(contract.interface.events.RegisterUserEvent);
// // console.log(contract.filters);
//
// var registerUser = contract.registerUser.getData(1);
// console.log(registerUser);
//
// contract.on("RegisterUserEvent", (author, oldValue, newValue, event) => {
//     console.log('RegisterUserEvent start...');
//     // Called when anyone changes the value
//
//     console.log(author);
//     // "0x14791697260E4c9A71f18484C9f997B308e59325"
//
//     console.log(oldValue);
//     // "Hello World"
//
//     console.log(newValue);
//     // "Ilike turtles."
//
//     // See Event Emitter below for all properties on Event
//     console.log(event.blockNumber);
//     // 4115004
// });
// ropsten output
// RegisterUserEvent start...
// 0x1549997c27676D4Dd6880b5D2311Ca78A24c5721
// 0xADBCcdd7578F391724836F54e9927c81b9009F64
// BigNumber { _hex: '0x5e0dccb5' }
// 7066291

// contract.interface.events.RegisterUserEvent(function(error, event) {
//     if (error) {
//         console.log(error);
//     }
//     // 打印出交易hash 及区块号
//     console.log("交易hash:" + event.transactionHash);
//     console.log("区块高度:" + event.blockNumber);
//     //   获得监听到的数据：
//     console.log("参与地址:" + event.returnValues.user);
//     console.log("参与金额:" + event.returnValues.price);
// });

// localhost
// // 引入web库
// var Web3 = require('web3');
// // 使用WebSocket协议 连接节点
// let web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
// // 获取合约实例
// var Crowdfunding = require('./build/contracts/Smartex_sol_Smartex.json');
// const crowdFund = new web3.eth.Contract(
//     Crowdfunding,
//     '0x52B81F226AF99019e91f73F160F07a1923C857F0'
// );
// console.log(crowdFund);
//  监听Join 加速事件
// crowdFund.events.RegisterUserEvent(function(error, event) {
//     if (error) {
//         console.log(error);
//     }
//     // 打印出交易hash 及区块号
//     console.log("交易hash:" + event.transactionHash);
//     console.log("区块高度:" + event.blockNumber);
//     //   获得监听到的数据：
//     console.log("参与地址:" + event.returnValues.user);
//     console.log("参与金额:" + event.returnValues.price);
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.all('*', function (req, res, next) {
//响应头指定了该响应的资源是否被允许与给定的origin共享。*表示所有域都可以访问，同时可以将*改为指定的url，表示只有指定的url可以访问到资源
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //允许请求资源的方式
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
