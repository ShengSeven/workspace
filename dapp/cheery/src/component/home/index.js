import React, { Component } from 'react';
import './index.css'
import Level from './Level';
import Grade from './Grade';
import Logs from './Logs';

import { message } from 'antd';
import "antd/dist/antd.css";

import { showAccount } from '../../store/actionCreators';
import Dark from '../common/Dark'
import store from '../../store/index';

import config from "../../ethereum/helper/config.js";
// const Instance = require('../../ethereum/instance');
import Instance from '../../ethereum/instance';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;

class Index extends Component {
    constructor(props) {
        super(props);
       //  this.state = {
       //      tabIndex : 0,
       //      userId: 0,
       //      address: '0x0000000000000000000000000000000000000000',
       //      // balance: 0,
       //      // currentLevel:0,
       //      conutReferralsNum:0
       // }
       this.state = store.getState();
       // this.setState({
       //   tabIndex : 0,
       //   userId: 0,
       //   address: '0x0000000000000000000000000000000000000000',
       //   conutReferralsNum:0
       // });

       this.storeChange = this.storeChange.bind(this);
       store.subscribe(this.storeChange);
       this.onClick = this.onClick.bind(this);
       this.logout = this.logout.bind(this);
       this.onShow = this.onShow.bind(this);
     }

     storeChange(){
       this.setState(store.getState());
     }

    onClick(tabIndex){
        this.setState({tabIndex})
    }

    onShow(showLoad){
        console.log("onShow:"+showLoad)
        this.setState({showLoad})
    }

    async componentDidMount() {
      const userId = sessionStorage.getItem('userID');
      const address = sessionStorage.getItem('address');

      if(userId == null || address == null) {
        message.error('请先登录进行操作!');
        this.props.history.push('/smartex/login');
        return;
      }

      if(instanceObj.messageStr != null) {
        message.error(instanceObj.messageStr);
        return;
      }


      // 设置最大等级
      var i = 1;
      var nowDate = new Date().getTime();
      for(i; i <= 6; i++) {
        var result = await instance.methods.getUserLevelExpiresAt(address, i).call();
        // 若有效期为 0即退出
        if(result == 0 || result * 1000 < nowDate){
          break;
        }
      }

      // 获取推荐的人数
      const conutReferralsNum = await instance.methods.conutReferralsNum(userId).call();

      // 获取收入
      var balance = await web3.eth.getBalance(address);
      balance = web3.utils.fromWei(balance, 'ether');

      this.setState({userId:userId, address:address, balance:balance, currentLevel:i-1, conutReferralsNum:conutReferralsNum});
    }

    logout() {
      sessionStorage.removeItem("userID");
      sessionStorage.removeItem("address");
      this.props.history.push('/smartex/login');
    }

    render() {
        const { tabIndex } = this.state;
        let dom = null;
        switch(tabIndex) {
            case 0 : dom = <Level onShow = {this.onShow}/>;break;
            case 1 : dom = <Logs />;break;
            case 2 : dom = <Grade />;break;
        }
        return (
            <div className="main">
                <Dark show={this.state.showLoad}/>
                <div className="head-div">
                    <div className="main-div">
                        <div className="left-div">你好，<span>{this.state.userId}</span></div>
                        <div className="middle-div">{this.state.address}</div>
                        <div className="right-div" onClick={this.logout}>退出登录</div>
                    </div>
                </div>
                <div className="main-div">
                    <div className="info-div">
                        <div className="info-item">
                            <div className="info-val-div"><span className="eli">{this.state.balance}</span> ETH</div>
                            <div className="info-text-div">
                                <span>余额</span>
                                <i className="info-icon balance-icon"></i>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-val-div">{this.state.conutReferralsNum}</div>
                            <div className="info-text-div">
                                <span>推荐</span>
                                <i className="info-icon recommend-icon"></i>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="info-val-div">{this.state.currentLevel}</div>
                            <div className="info-text-div">
                                <span>当前等级</span>
                                <i className="info-icon grade-icon"></i>
                            </div>
                        </div>
                    </div>
                    <div className="content-div">
                        <div className="tab-div">
                            <div className={`tab-item ${tabIndex===0?'active':''}`} onClick={()=>this.onClick(0)}>面板</div>
                            <div className={`tab-item ${tabIndex===1?'active':''}`} onClick={()=>this.onClick(1)}>统计</div>
                            <div className={`tab-item ${tabIndex===2?'active':''}`} onClick={()=>this.onClick(2)}>上线</div>
                        </div>
                        {dom}
                    </div>
                </div>
            </div>
         );
    }
}

export default Index;
