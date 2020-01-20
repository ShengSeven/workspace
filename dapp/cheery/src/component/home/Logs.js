import React, { Component } from 'react';

import config from "../../ethereum/helper/config.js";
var axios = require("axios");

class Logs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabIndex : 0,
            logs: []
            // logs:[
            //     {
            //         id:1,
            //         name:'等级1',
            //         price:0.5,
            //         time:72
            //     },
            //     {
            //         id:2,
            //         name:'等级2',
            //         price:1,
            //         time:36
            //     },
            // ],
         }
         // this.onClick = this.onClick.bind(this);
    }

    onTab(tabIndex){
        this.setState({tabIndex: tabIndex}, async()=>{
          this.statistic();
        });
    }

    async componentDidMount() {
      this.statistic();
    }

    // 统计
    async statistic() {

      var format = function(time, format){
          var t = new Date(time);
          var tf = function(i){return (i < 10 ? '0' : '') + i};
          return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
              switch(a){
                  case 'yyyy':
                      return tf(t.getFullYear());
                      break;
                  case 'MM':
                      return tf(t.getMonth() + 1);
                      break;
                  case 'mm':
                      return tf(t.getMinutes());
                      break;
                  case 'dd':
                      return tf(t.getDate());
                      break;
                  case 'HH':
                      return tf(t.getHours());
                      break;
                  case 'ss':
                      return tf(t.getSeconds());
                      break;
              }
          })
      }

      var logs = [];

      const accounts = sessionStorage.getItem('address');

      var resArr = [];
      var tabIndex = this.state.tabIndex;
      // console.log(tabIndex);
      if(tabIndex === 0) {
        resArr = await new Promise((resolve, reject) => {
          axios.get("http://"+config.ipAddress+"/getTo",{params:{toAddr:accounts}}).then(
            (res) => {resolve(res)}
          );
        });

        for(var i = 0;i < resArr.data.length; i++) {
          var levelStr = 0.5;
          for(var a = 1; a < resArr.data[i].level_str; a++) {
            levelStr = levelStr * 2;
          }
          logs.push({address: resArr.data[i].from_addr, money: levelStr, time: format(resArr.data[i].time_stmp*1000, 'yyyy-MM-dd HH:mm:ss')});
        }
      } else {
        resArr = await new Promise((resolve, reject) => {
          axios.get("http://"+config.ipAddress+"/getFrom",{params:{fromAddr:accounts}}).then(
            (res) => {resolve(res)}
          );
        });

        for(var i = 0;i < resArr.data.length; i++) {
          var levelStr = 0.5;
          for(var a = 1; a < resArr.data[i].level_str; a++) {
            levelStr = levelStr * 2;
          }
          logs.push({address: resArr.data[i].to_addr, money: levelStr, time: format(resArr.data[i].time_stmp*1000, 'yyyy-MM-dd HH:mm:ss')});
        }
      }

      this.setState({logs:logs});

    }

    render() {
        const {logs, tabIndex} = this.state;
        return (
            <div className="log-div">
                <div className="log-tab-div">
                    <div className={`log-tab ${tabIndex===0?'active':''}`} onClick={()=>this.onTab(0)}>收入</div>
                    <div className={`log-tab ${tabIndex===1?'active':''}`} onClick={()=>this.onTab(1)}>支出</div>
                </div>
                <div className="log-content">
                    <div className="log-head">
                        <span className="address-span">地址</span>
                        <span className="price-span">金额</span>
                        <span className="time-span">时间</span>
                    </div>
                    {
                        logs.map((item,index)=>{
                            return(
                                <div className="log-item" key={item+index}>
                                    <span className="address-span">{item.address}{/*0xcca42d25c9CFAea03D*/}</span>
                                    <span className="price-span">{item.money}{/*0.5ETH*/}</span>
                                    <span className="time-span">{item.time}{/*2020-01-01 16:16:16*/}</span>
                                </div>
                            )
                        })
                    }

                </div>
            </div>
         );
    }
}

export default Logs;
