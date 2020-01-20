var express = require('express');
var router = express.Router();

// add
var mysql = require('mysql');
var Database = require('./mysql_connect');

// 创建实例
var db = new Database();

// 定义/addTransaction 路由，用于添加交易数据
router.get('/addTransaction', function (req, res, next) {
    console.log('addTransaction start...');
    // 将交易数据存入数据库
    db.addTransaction(req, res);
});

// 定义/getFrom路由，用于获取支出交易
router.get('/getFrom', function (req, res, next) {
    db.getFrom(req, res);
});

// 定义/getTo路由，用于获取收入交易
router.get('/getTo', function (req, res, next) {
    db.getTo(req, res);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
