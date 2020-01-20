import React, { Component } from 'react';
import { message } from 'antd';
import "antd/dist/antd.css";

import { showAccount } from '../../store/actionCreators';
import store from '../../store/index';

import config from "../../ethereum/helper/config.js";
// const Instance = require('../../ethereum/instance');
import Instance from '../../ethereum/instance';
import Gas from '../../ethereum/gas';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;

// const Gas = require('../../ethereum/gas');
const gas = new Gas();
var axios = require("axios");

class Level extends Component {
    constructor(props) {
        super(props);
       //  this.state = {
       //    levels: []
       //      // levels:[
       //      //     {
       //      //         id:1,
       //      //         name:'等级1',
       //      //         price:0.5,
       //      //         time:72
       //      //     },
       //      //     {
       //      //         id:2,
       //      //         name:'等级2',
       //      //         price:1,
       //      //         time:36
       //      //     },
       //      //     {
       //      //         id:3,
       //      //         name:'等级3',
       //      //         price:2
       //      //     },
       //      //     {
       //      //         id:4,
       //      //         name:'等级4',
       //      //         price:4
       //      //     },
       //      //     {
       //      //         id:5,
       //      //         name:'等级5',
       //      //         price:8
       //      //     },
       //      //     {
       //      //         id:6,
       //      //         name:'等级6',
       //      //         price:16
       //      //     },
       //      // ],
       // }
       this.state=store.getState();
       this.storeChange = this.storeChange.bind(this);
       store.subscribe(this.storeChange);
     }

     storeChange(){
       this.setState(store.getState());
     }

    // 获取等级信息
    async getLevelInfo() {

      const addr = sessionStorage.getItem('address');
      if(addr == null) {
        return;
      }

      const levelPrices = ["0.5", "1", "2", "4", "8", "16"];

      // 获取当前用户拥有等级信息
      const levelExpiresAt =  await Promise.all(
        Array(parseInt(6)).fill().map((element, index)=>{
          return instance.methods.getUserLevelExpiresAt(addr, index+1).call();
        })
      );
      var levels = [];
      levelPrices.map((levelPrice,index)=>{
        levels.push({id:index, name:'等级'+(index+1), price: levelPrices[index], time:this.formatDate(levelExpiresAt[index])});
      });

      const nowDate = new Date().getTime();
      // 存储过期或者未购买的索引位置
      var activeInd = 6;
      for(var i = 0; i <= 6; i++) {
        var levelExpire = levelExpiresAt[i];
        if(activeInd == 6 && (levelExpire == 0 || levelExpire * 1000 < nowDate)) {
          activeInd = i;
        }
      }
      this.setState({levelPrices: levelPrices, activeInd: activeInd, levels: levels});
    }

    // 购买等级
    async buyLevel(level) {
      const {onShow} = this.props;
      onShow(true);
      // 获取账户
      const accounts = await web3.eth.getAccounts();
      const addr = sessionStorage.getItem('address');
      if(accounts[0] != addr){
        // console.log('请切换 Metamask 账户至当前登录地址!');
        message.error('请切换 Metamask 账户至当前登录地址!');
        onShow(false);
        return;
      }

      // 获取购买等级对应的价格
      var money = web3.utils.toWei(this.state.levelPrices[level-1], 'ether');

      // 获取购买等级 gas值
      let estimateGas = await gas.getBuyLevelGas(level, money);
      // console.log('level:'+level+';money:'+money+';estimateGas:'+estimateGas);

      var event = await instance.methods.buyLevel(level).send({
        from:addr,
        value:money,
        gas: estimateGas
      });

      // 购买等级交易插入数据库，暂时先这样写，已有方案，待修改。
      const getLevelProfitEvent = event.events.GetLevelProfitEvent.returnValues;
      this.setState({getLevelProfitEvent:getLevelProfitEvent}, ()=>{
        const fromAddr = getLevelProfitEvent.user;
        const toAddr = getLevelProfitEvent.referral;
        const levelStr = getLevelProfitEvent.level;
        const timeStmp = getLevelProfitEvent.time;

        // console.log(fromAddr+','+toAddr+','+levelStr+','+timeStmp);
        axios.get("http://"+config.ipAddress+"/addTransaction",{params:{fromAddr:fromAddr,toAddr:toAddr,levelStr:levelStr,timeStmp:timeStmp}}).then(
          value=>{
            // this.find();
            onShow(false);
          },error=>{message.error('购买等级插入数据失败!信息:'+error.message);onShow(false);});
      });

      // 获取新数据
      // 获取收入
      var balance = await web3.eth.getBalance(addr);
      balance = web3.utils.fromWei(balance, 'ether');

      // 设置最大等级
      var i = 1;
      var nowDate = new Date().getTime();
      for(i; i <= 6; i++) {
        var result = await instance.methods.getUserLevelExpiresAt(addr, i).call();
        // 若有效期为 0即退出
        if(result == 0 || result * 1000 < nowDate){
          break;
        }
      }

      const action = showAccount(
         i-1,
         balance
      );

     message.success('购买等级成功!');
     store.dispatch(action);

    }

    formatDate(time){
      if(time == 0){
        return '暂未购买';
      }
      var date = parseInt(new Date() / (1000 * 60 * 60 * 24));
      time = parseInt(time / (60 * 60 * 24));
      // var date = parseInt(new Date() / (1000 * 60));
      // time = parseInt(time / 60);
      return time - date;
    }

    render() {
      this.getLevelInfo();
        const {levels} = this.state;
        return (
            <div className="level-div">
                {
                    levels.map((item,index)=>{
                        return (
                            <div className={`level-item ${item.id===this.state.activeInd?'active':''}`} key={item+index}>
                                <div className="level-title">{item.name}</div>
                                <div className="level-body">
                                    <div className="price-div">
                                        <span>等级价格：</span>{item.price} ETH
                                    </div>
                                    <div className="time-div">
                                        <span>剩余时间：</span>{item.time?item.time:'暂未购买'}
                                        <span className="buy-btn" onClick={item.id===this.state.activeInd?()=>this.buyLevel(index+1):''}>购买</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
         );
    }
}

export default Level;
