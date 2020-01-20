import React, { Component } from 'react';

import config from "../../ethereum/helper/config.js";
// const Instance = require('../../ethereum/instance');
import Instance from '../../ethereum/instance';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;

class Grade extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
            // list:[
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
            //     {
            //         id:3,
            //         name:'等级2',
            //         price:1,
            //         time:36
            //     },
            // ]
         }
    }

    // 获取上线
    async getUpline() {
      const addr = sessionStorage.getItem('address');

      // 获取上线地址
      const uplineArr = await Promise.all(
        Array(3).fill().map((element, index)=>{
          return instance.methods.getUserUpline(addr, index+1).call();
        })
      );

      // 通过上线地址获取编号
      const idArr = await Promise.all(
        Array(3).fill().map((element, index)=>{
          return instance.methods.users(uplineArr[index]).call();
        })
      );

      var uplineItems = [];
      uplineArr.map((upline,index)=>{
        if(upline != addr) {
          uplineItems.push({id: idArr[index].id, address: upline});
        } else {
          uplineItems.push({id: 0, address: '0x0000000000000000000000000000000000000000'});
        }
      });
      this.setState({list:uplineItems});
    }

    render() {
        this.getUpline();
        const {list} = this.state;
        return (
            <div className="level-div">
                {
                    list.map((item,index)=>{
                        return (
                            <div className="level-item " key={item+index}>
                                <div className="level-title">{index+1}级上线</div>
                                <div className="level-body">
                                    <div className="price-div">
                                        <span>用户编号：</span>{item.id}
                                    </div>
                                    <div className="time-div">
                                        <span>地址：</span>{item.address.substr(0,10).concat('...').concat(item.address.substr(30))}{/* 0xcca42d25c9.....CFAea03D */}
                                        {/* <span className="buy-btn">购买</span> */}
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

export default Grade;
