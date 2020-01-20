var mysql = require('mysql');

class Database {

    constructor() {
        // 连接mysql 数据库
        this.connection = mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '123456',
            database: 'smartex',
            port: 3306,
            charset: 'UTF8_GENERAL_CI',
            timezone: 'local',
            multipleStatements: false
        });
    }

    // 向transaction 表中添加记录
    // req和res 用于获取用户请求和用户响应，这两个参数会从相应的路由函数传入
    addTransaction(req, res) {
        // 通过insert into语句将数据插入transaction 表中
        this.connection.query("insert into transaction set ?",
            {from_addr:req.query.fromAddr, to_addr:req.query.toAddr, level_str:req.query.levelStr, time_stmp:req.query.timeStmp},
            function(err, result){
                if(err) {
                    console.log(err);
                }else {
                    console.log(result);
                    res.send(result);
                }
            });
    }

    // 获取支出交易
    getFrom(req, res) {
        this.connection.query("select * from transaction where ?", {from_addr:req.query.fromAddr}, function (err, result) {
            if(err) {
                console.log(err);
            }else {
                console.log(result);
                res.send(result);
            }
        });
    }

    // 获取收入交易
    getTo(req, res) {
        this.connection.query("select * from transaction where ?", {to_addr:req.query.toAddr}, function (err, result) {
            if(err) {
                console.log(err);
            }else {
                console.log(result);
                res.send(result);
            }
        });
    }

}

module.exports = Database;