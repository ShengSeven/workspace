import React, { Component,Fragment } from 'react'
import { Button, Input, Tabs, Checkbox, message } from 'antd'

import Dark from '../common/Dark'

import "antd/dist/antd.css"
import './login.css'

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

// 不同注册方式 tab 页
const { TabPane } = Tabs
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: true,
      activeIndex: '1' ,// 为 1 时 表示选择 自动分配 ，为 2 是表示选择了手动注册,
      id: 1,
      loginInput:'',
      address: config.contractAddress,
      amount: '0.5 ETH',
      downLoadAddress: 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
      checked: false,
      showLoad:false
    }
    this.login = this.login.bind(this)
    this.register = this.register.bind(this)
  }
  async login() {
    try {
      this.setState({showLoad :true})
      if (this.state.isLogin === true) {

        if(instanceObj.messageStr != null) {
          message.error(instanceObj.messageStr);
          this.setState({showLoad :false})
          return;
        }

        // 判断选择的网络是否一致
        let curNetworkVersion = web3.currentProvider.networkVersion;
        curNetworkVersion = typeof curNetworkVersion !== 'undefined' ? curNetworkVersion : 5777;
        if(curNetworkVersion != config.networkVersion) {
          config.networkVersionMap.map(networkVersion => {
            if(networkVersion.id == config.networkVersion) {
                message.error('请切换至'+networkVersion.name+'!');
                this.setState({showLoad :false})
                return;
             }
          })
          return;
        }

        // 执行登录操作
        // message.loading('正在登录...')
        var loginInput = this.state.loginInput;
        if(loginInput == '') {
          // console.log('请输入用户编号或地址!');
          message.error('请输入用户编号或地址!');
          this.setState({showLoad :false})
          return;
        }
        var isAddress = web3.utils.isAddress(web3.utils.toHex(loginInput));

        // 输入为用户编号
        if(!isAddress) {
          loginInput = await instance.methods.userAddresses(loginInput).call();
        }

        if(loginInput == null || loginInput === '0x0000000000000000000000000000000000000000') {
          // console.log('用户不存在!');
          message.error('用户不存在!');
          this.setState({showLoad :false})
          return;
        }

        // 通过用户地址查询用户
        const user = await instance.methods.users(web3.utils.toHex(loginInput.toString())).call();

        // 用户不存在
        if(user.id === 0) {
          // console.log('用户不存在!');
          message.error('用户不存在!');
          this.setState({showLoad :false})
          return;
        } else {
          // 用户存在
          sessionStorage.setItem("userID", user.id);
          sessionStorage.setItem("address", loginInput);
          message.success('登录成功!');
          this.setState({showLoad :false})
          this.props.history.push('/smartex');
        }
      } else {
        // 切换到登录页
        this.setState({ isLogin: true,showLoad :false })
      }
    } catch(e) {
      message.error('登录失败!信息:'+e.message);
      this.setState({showLoad :false})
    }
  }
  async register() {

    if (this.state.isLogin === true) {
      // 切换到注册页
      this.setState({ isLogin: false })
    } else {

      if(instanceObj.messageStr != null) {
        message.error(instanceObj.messageStr);
        return;
      }

      // 判断选择的网络是否一致
      let curNetworkVersion = web3.currentProvider.networkVersion;
      curNetworkVersion = typeof curNetworkVersion !== 'undefined' ? curNetworkVersion : 5777;
      if(curNetworkVersion != config.networkVersion) {
        config.networkVersionMap.map(networkVersion => {
          if(networkVersion.id == config.networkVersion) {
              message.error('请切换至'+networkVersion.name+'!');
              this.setState({showLoad :false})
              return;
           }
        })
        return;
      }

      try {
        this.setState({showLoad :true})
        // 执行注册操作
        let referrerID = 1;
        const accounts = await web3.eth.getAccounts();

        // 查看该用户是否已注册
        const curUser = await instance.methods.users(web3.utils.toHex(accounts[0])).call();
        if(curUser.id != 0) {
          // console.log('您已注册，您的编号为:'+curUser.id+'，请登录查看!');
          message.error('您已注册，您的编号为:'+curUser.id+'，请登录查看!');
          this.setState({showLoad :false})
          return;
        }

        // 手动注册
        if(this.state.activeIndex == '2') {
          if(this.state.id == 1) {
            // console.log('请输入上线地址!');
            message.error('请输入上线地址!');
            this.setState({showLoad :false})
            return;
          }

          var isAddress = web3.utils.isAddress(web3.utils.toHex(this.state.id.toString()));

          // 输入为用户编号
          if(!isAddress) {
            message.error('请输入正确地址!');
            this.setState({showLoad :false})
            return;
          }

          // 查找上线地址对应的用户编号
          // console.log(web3.utils.toHex('0x514a1cb24364861c8b7b35b9c10789e08a75f343'));
          const user = await instance.methods.users(web3.utils.toHex(this.state.id.toString())).call();
          if(user == null || (user != null && user.id == 0)) {
            // console.log('该用户不存在，请重新输入!');
            message.error('该上线用户不存在，请重新输入!');
            this.setState({showLoad :false})
            return;
          }
          referrerID = user.id;
          // console.log(referrerID);

          // 是否同意
          if(!this.state.checked) {
            message.error('请阅读并同意以下条款!');
            this.setState({showLoad :false})
            return;
          }
        }

        // 获取注册 gas值
        let estimateGas = await gas.getRegisterUserGas(referrerID);

        // 注册
        const money = web3.utils.toWei("0.5", "ether");
        var event = await instance.methods.registerUser(referrerID).send({
          from:accounts[0],
          value:money,
          gas: estimateGas
        });

        // 注册成功，加入数据库。暂时这样写，已有方案，待修改。
        const getLevelProfitEvent = event.events.GetLevelProfitEvent.returnValues;
        this.setState({getLevelProfitEvent:getLevelProfitEvent}, ()=>{
          const fromAddr = getLevelProfitEvent.user;
          const toAddr = getLevelProfitEvent.referral;
          const levelStr = getLevelProfitEvent.level;
          const timeStmp = getLevelProfitEvent.time;

          // console.log(fromAddr+','+toAddr+','+levelStr+','+timeStmp);
          axios.get("http://"+config.ipAddress+"/addTransaction",{params:{fromAddr:fromAddr,toAddr:toAddr,levelStr:levelStr,timeStmp:timeStmp}}).then(
          value=>{
          },error=>{message.error('注册插入数据失败!信息:'+error.message)});
        });

        // console.log(this.state.activeIndex)
        // message.loading('正在注册...')
        var messageContent = await instance.methods.users(accounts[0]).call();
        // console.log(messageContent);
        message.success('注册成功，用户编号为 '+messageContent.id);
        this.setState({showLoad :false,isLogin: true})
      } catch(e) {
        message.error('注册失败!信息:'+e.message);
        this.setState({showLoad :false})
      }
    }
  }

  onChange = e => {
    // console.log('checked = ', e.target.checked);
    this.setState({
      checked: e.target.checked,
    });
  };

  render(){
    const {showLoad} = this.state
    return (
      <Fragment>
      <Dark show = {showLoad}/>
      <div className='content'>
        {/* isLogin 为 true 时展示登录页，为 false 则展示注册页 */}
        {this.state.isLogin ? (<div className='top'>
          <p className='title'>登录</p>
          <Input placeholder="请输入用户编号或地址"
          onChange={
            event=>this.setState({loginInput:event.target.value
          })}  />
          <div className='tips'>
            <div>
              <img src={require('../../image/remind.png')}></img>
            </div>
            <p className='text'>温馨提示：登录注册前，请先下载插件 <a href={this.state.downLoadAddress}>{this.state.downLoadAddress}</a> </p>
          </div>
        </div>) : (<div className='top'>
          <Tabs defaultActiveKey="1" onTabClick={(key) => { this.setState({ activeIndex: key }) }}>
            <TabPane tab="自动分配" key="1">
              <p className='tabTitle'>推荐人编号</p>
              <Input defaultValue={this.state.id} disabled='true' />
            </TabPane>
            <TabPane tab="手动注册" key="2">
              <p className='tabTitle'>合约地址</p>
              <Input defaultValue={this.state.address} disabled='true' />
              <p className='tabTitle'>注册金额</p>
              <Input placeholder="请输入注册金额" defaultValue={this.state.amount} disabled='true' />
              <p className='tabTitle'>上线地址</p>
              <Input placeholder="请输入上线地址"
              onChange={
                event=>this.setState({id:event.target.value
              })} />
              <Checkbox onChange={this.onChange}
                        checked={this.state.checked}>我同意从我的Ethereum钱包发送 <span className='data'>{this.state.amount}</span> 到合约地址</Checkbox>
            </TabPane>
          </Tabs>
        </div>)}
        <div className='bottom'>
          <Button type="default" className={this.state.isLogin ? 'active' : ''} onClick={this.login}>登录</Button>
          <Button type="default" className={this.state.isLogin ? '' : 'active'} onClick={this.register}>注册</Button>
        </div>
      </div>
      </Fragment>
    );
  }
}

export default Login
