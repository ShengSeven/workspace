import React, { Component } from 'react';
import './register.css'
import '../user/buy.css'

// import { message } from 'antd';
// import "antd/dist/antd.css";

import config from "../../ethereum/helper/config.js";
import Instance from '../../ethereum/instance';
import Gas from '../../ethereum/gas';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;
const gas = new Gas();

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account : "",
            num:1
        }
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onClick = this.onClick.bind(this);
    }
    onChange(e){
        const _val = e.target.value;
        this.setState({account:_val})
    }
    onClick(num){
        this.setState({num})
    }
    
    async onSubmit(){
        const {onShow} = this.props
        const { account,num } = this.state;
        // console.log("上级邀请人:"+account+",购买数量:"+num)

        try{
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

            // 查看该用户是否已注册
            const accounts = await web3.eth.getAccounts();
            const curUser = await instance.methods.getUserInfo_UI(web3.utils.toHex(accounts[0])).call();
            
            if(curUser[0] != 0) {
                // console.log('您已注册，您的编号为:'+curUser[0]+'，请登录查看!');
                alert('您已注册，您的编号为:'+curUser[0]+'，请登录查看!');
                // message.error('您已注册，您的编号为:'+curUser.id+'，请登录查看!');
                return;
            }

            // 邀请人编号
            let referrerID = 1;
            let referrerAddr = "";
            
            // 邀请人编号或地址不为空,
            if(account != "" && account != null) {
                // 判断输入是否为地址
                var isAddress = web3.utils.isAddress(web3.utils.toHex(account.toString()));

                // 输入为编号
                if(!isAddress) {
                    // 查找编号对应地址
                    referrerAddr = await instance.methods.getUserAddresses_UI(account).call(); 
                } else {
                    // 输入为地址
                    referrerAddr = account;
                }

                if(referrerAddr == null || referrerAddr == '0x0000000000000000000000000000000000000000') {
                    // console.log('该上线用户不存在，请重新输入!');
                    alert('该上线用户不存在，请重新输入!');
                    // message.error('该上线用户不存在，请重新输入!');
                    return;
                }

                // 查找上线地址对应的用户编号
                let user = await instance.methods.getUserInfo_UI(web3.utils.toHex(referrerAddr)).call();
                if(user == null || (user != null && user[0] == 0)) {
                    // console.log('该上线用户不存在，请重新输入!');
                    alert('该上线用户不存在，请重新输入!');
                    // message.error('该上线用户不存在，请重新输入!');
                    return;
                }
                referrerID = user[0];
            }

            // 获取水果单价
            let fruitPrice = await instance.methods.FRUIT_PRICE().call();

            let money = fruitPrice * 1;
            
            // 获取注册所需的 Gas 值
            let estimateGas = await gas.getRegisterUserGas(referrerID, accounts[0], money);
            
            // 注册
            await instance.methods.registerUser_UI(referrerID).send({
                from:accounts[0],
                value:money,
                gas: estimateGas
            });

            let messageContent = await instance.methods.getUserInfo_UI(accounts[0]).call();
            // console.log('注册成功，用户编号为 '+messageContent[0]);
            alert('注册成功，用户编号为 '+messageContent[0]);
            // message.success('注册成功，用户编号为 '+messageContent.id);
        
        } catch(e) {
            // console.log('注册失败!信息:'+e.message);
            alert('注册失败!信息:'+e.message);
            // message.error('注册失败!信息:'+e.message);
        }

        onShow();
    }
    render() {
        const { account,num } = this.state;
        const {showRegister,onShow} = this.props;
        return (
            <div className={`register-div ${showRegister?'active':""}`}>
                <div className="dark" onClick={()=>onShow()}></div>
                <div className="register-content">
                    <div className="register-panel">
                        <i className="close-btn" onClick={()=>onShow()}></i>
                        <h2 className="register-title">欢  迎  注  册</h2>
                        <p>
                            <input className="register-input" type="text" placeholder="请输入邀请人会员编号或地址（非必填）" value={account} onChange={this.onChange}/>
                        </p>
                        {/*<div className="buy-div">
                            <div className="buy-text">首次购买数量</div>
                            <div className={`buy-item ${num==1?'active':''}`} onClick={()=>this.onClick(1)}>1</div>
                            <div className={`buy-item ${num==5?'active':''}`} onClick={()=>this.onClick(5)}>5</div>
                            <div className={`buy-item ${num==10?'active':''}`} onClick={()=>this.onClick(10)}>10</div>
                        </div>*/}
                        <div className="register-btn" onClick={()=>this.onSubmit()}>注  册</div>
                        {/* <span className="small-text">返回登录>></span> */}
                    </div>
                </div>
            </div>
        );
    }
}

export default Register;
