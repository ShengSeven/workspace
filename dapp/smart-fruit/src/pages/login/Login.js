import React, { Component } from 'react';

import Register from '../register';

import './login.css'
import { register } from '../../serviceWorker';

import config from "../../ethereum/helper/config.js";
import Instance from '../../ethereum/instance';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account : "",
            showRegister : false
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onShow = this.onShow.bind(this);
    }
    onChange(e){
        const _val = e.target.value;
        this.setState({account:_val})
    }
    onShow(){
        this.setState({
            showRegister : !this.state.showRegister
        })
    }
    async onSubmit(){
        try{
            let account = this.state.account;

            // 编号或地址为空
            if(account == "" || account == null) {
                // console.log('请输入用户编号或地址!');
                alert('请输入用户编号或地址!');
                return;
            }

            // 判断获取合约实例是否正确
            if(instanceObj.messageStr != null) {
                // console.log(instanceObj.messageStr);
                alert(instanceObj.messageStr);
                // message.error(instanceObj.messageStr);
                return;
            }

            // 判断选择的网络是否一致
            let curNetworkVersion = web3.currentProvider.networkVersion;
            curNetworkVersion = typeof curNetworkVersion !== 'undefined' ? curNetworkVersion : 5777;
            if(curNetworkVersion != config.networkVersion) {
                config.networkVersionMap.map(networkVersion => {
                    if(networkVersion.id == config.networkVersion) {
                        // console.log('请切换至'+networkVersion.name+'!');
                        alert('请切换至'+networkVersion.name+'!');
                        // message.error('请切换至'+networkVersion.name+'!');
                        return;
                    }
                })
                return;
            }        

            let addr = "";
            // 判断输入是否为地址
            var isAddress = web3.utils.isAddress(web3.utils.toHex(account.toString()));

            // 输入为编号
            if(!isAddress) {
                // 查找编号对应地址
                addr = await instance.methods.getUserAddresses_UI(account).call(); 
            } else {
                // 输入为地址
                addr = account;
            }

            if(addr == null || addr == '0x0000000000000000000000000000000000000000') {
                // console.log('该用户不存在，请重新输入!');
                alert('该用户不存在，请重新输入!');
                // message.error('该用户不存在，请重新输入!');
                return;
            }

            // 查找上线地址对应的用户编号
            let user = await instance.methods.getUserInfo_UI(addr).call();
            if(user == null || (user != null && user[0] == 0)) {
                // console.log('该用户不存在，请重新输入!');
                alert('该用户不存在，请重新输入!');
                // message.error('该用户不存在，请重新输入!');
                return;
            }

            // 调用登录接口
            let result = await instance.methods.login_UI(addr).call();
            // console.log('login_ui result:'+result);

            // result 为 0 允许登录, 为 1 过期状态
            if(result == 1) {
                // console.log('该账户已过期!');
                alert('该账户已过期!');
                // message.error('该账户已过期!');
                return;
            }
            sessionStorage.setItem("userID", user[0]);
            sessionStorage.setItem("address", addr);
            this.props.history.push("/smartFruit/user-info");

        } catch(e) {
            // console.log('登录失败!信息:'+e.message);
            alert('登录失败!信息:'+e.message);
            // message.error('登录失败!信息:'+e.message);
        }

    }
    render() {
        const { account,showRegister } = this.state;
        return (
            <div className="login-div">
                <div className={`login-content ${showRegister?'':'active'}`}>
                    <div className="dark"></div>
                    <div className="login-panel">
                        <h2 className="login-title">欢  迎  登  录</h2>
                        <p>
                            <input className="login-input" type="text" placeholder="请输入会员编号或地址" value={account} onChange={this.onChange}/>
                        </p>
                        <div className="login-btn" onClick={()=>this.onSubmit()}>登  录</div>
                        <span className="small-text" onClick={this.onShow}>前往注册>></span>
                    </div>
                </div>
                <Register
                    showRegister = {showRegister}
                    onShow = {this.onShow}
                />
            </div>
        );
    }
}

export default Login;
