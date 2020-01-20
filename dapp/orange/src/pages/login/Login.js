import React, { Component } from 'react';
import './login.css'
import { Tabs, Input, Button, Divider, message } from 'antd';
import "antd/dist/antd.css"
import Loading from '../common/loading'

import config from "../../ethereum/helper/config.js";
import Instance from '../../ethereum/instance';
import Gas from '../../ethereum/gas';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;
const gas = new Gas();

const { TabPane } = Tabs;
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: "",
            regAccount: "",
            showLoad: false
        }
        this.onChange = this.onChange.bind(this);
        this.onRegChange = this.onRegChange.bind(this);
    }

    onChange(e) {
        const _val = e.target.value;
        this.setState({ account: _val })
    }

    onRegChange(e) {
        const _val = e.target.value;
        this.setState({ regAccount: _val })
    }

    // 登录
    async onSubmit() {
        this.setState({ showLoad: true });
        document.body.style.overflow = 'hidden'
        try {
            let account = this.state.account;

            // 编号或地址为空
            if (account == "" || account == null) {
                message.error('请输入会员编号或地址!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                return;
            }           

            // 判断选择的网络是否一致
            let curNetworkVersion = web3.currentProvider.networkVersion;
            curNetworkVersion = typeof curNetworkVersion !== 'undefined' ? curNetworkVersion : 5777;
            if (curNetworkVersion != config.networkVersion) {
                config.networkVersionMap.map(networkVersion => {
                    if (networkVersion.id == config.networkVersion) {
                        message.error('请切换至' + networkVersion.name + '!');
                        this.setState({ showLoad: false });
                        document.body.style.overflow = 'scroll'
                        return;
                    }
                })
                return;
            }

            let addr = "";
            // 判断输入是否为地址
            var isAddress = web3.utils.isAddress(web3.utils.toHex(account.toString()));

            // 输入为编号
            if (!isAddress) {
                // 查找编号对应地址
                addr = await instance.methods.getUserAddresses_UI(account).call();
            } else {
                // 输入为地址
                addr = account;
            }

            if (addr == null || addr == '0x0000000000000000000000000000000000000000') {
                message.error('该用户不存在，请重新输入!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                return;
            }

            // 查找上线地址对应的用户编号
            let user = await instance.methods.getUserInfo_UI(addr).call();
            if (user == null || (user != null && user[0] == 0)) {
                message.error('该用户不存在，请重新输入!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                return;
            }

            // 调用登录接口
            let result = await instance.methods.login_UI(addr).call();
            // console.log('login_ui result:'+result);

            // result 为 0 允许登录, 为 1 过期状态
            if (result == 1) {
                message.error('该账户已过期!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                return;
            }
            sessionStorage.setItem("userID", user[0]);
            sessionStorage.setItem("address", addr);
            this.props.history.push("/smartOrange");

            message.success('登录成功!');
            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'

        } catch (e) {
            message.error('登录失败!');
            console.log('登录失败!信息:'+e.message);
            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        }

    }
    
    // 回车登录
    onKeyLogin =(event) =>{
    	if(event.keyCode == 13){
    		this.onSubmit();
    	}	
    }
    
    // 回车注册
    onKeyReg =(event) =>{
    	if(event.keyCode == 13){
    		this.onRegister();
    	}	
    }

    // 注册
    async onRegister() {
        const { regAccount } = this.state;
        // console.log("上级邀请人:"+regAccount)
        this.setState({ showLoad: true });
        document.body.style.overflow = 'hidden'
        try {           

            // 判断选择的网络是否一致
            let curNetworkVersion = web3.currentProvider.networkVersion;
            curNetworkVersion = typeof curNetworkVersion !== 'undefined' ? curNetworkVersion : 5777;
            if (curNetworkVersion != config.networkVersion) {
                config.networkVersionMap.map(networkVersion => {
                    if (networkVersion.id == config.networkVersion) {
                        message.error('请切换至' + networkVersion.name + '!');
                        this.setState({ showLoad: false });
                        document.body.style.overflow = 'scroll'
                        return;
                    }
                })
                return;
            }

            // 查看该用户是否已注册
            const accounts = await web3.eth.getAccounts();
            const curUser = await instance.methods.getUserInfo_UI(web3.utils.toHex(accounts[0])).call();

            if (curUser[0] != 0) {
                message.error('您已注册，您的编号为:' + curUser[0] + '，请登录查看!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                return;
            }

            // 邀请人编号
            let referrerID = 1;
            let referrerAddr = "";

            // 邀请人编号或地址不为空,
            if (regAccount != "" && regAccount != null) {
                // 判断输入是否为地址
                var isAddress = web3.utils.isAddress(web3.utils.toHex(regAccount.toString()));

                // 输入为编号
                if (!isAddress) {
                    // 查找编号对应地址
                    referrerAddr = await instance.methods.getUserAddresses_UI(regAccount).call();
                } else {
                    // 输入为地址
                    referrerAddr = regAccount;
                }

                if (referrerAddr == null || referrerAddr == '0x0000000000000000000000000000000000000000') {
                    message.error('该上线用户不存在，请重新输入!');
                    this.setState({ showLoad: false });
                    document.body.style.overflow = 'scroll'
                    return;
                }

                // 查找上线地址对应的用户编号
                let user = await instance.methods.getUserInfo_UI(web3.utils.toHex(referrerAddr)).call();
                if (user == null || (user != null && user[0] == 0)) {
                    message.error('该上线用户不存在，请重新输入!');
                    this.setState({ showLoad: false });
                    document.body.style.overflow = 'scroll'
                    return;
                }

                // 判断该用户是否拥有推荐权
                if(user[0] != 1 && (user[1] != 2 || user[1] != 3)) {
                    message.error('该上线用户没有推荐权!');
                    this.setState({ showLoad: false });
                    document.body.style.overflow = 'scroll'
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
                from: accounts[0],
                value: money,
                gas: estimateGas
            });

            let messageContent = await instance.methods.getUserInfo_UI(accounts[0]).call();
            message.success('注册成功，用户编号为 ' + messageContent[0]);

            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        } catch (e) {
            message.error('注册失败!');
            console.log('注册失败!信息:' + e.message);
            
            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        }
    }

    render() {
        const { showLoad, account, regAccount } = this.state
        return (
            <div className='bg-login'>
                <Loading show={showLoad} />
                <div className='content'>
                    <div className='logo'>
                        <img src={require('../../static/img/logo_orange.png')}></img>
                    </div>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="登录" key="1">
                            <div className='login'>
                                <p className='label'>会员编号或地址</p>
                                <Input value={account} onChange={this.onChange} onKeyDown={this.onKeyLogin} />
                                <Button type="primary" onClick={() => this.onSubmit()}>登录</Button>
                            </div>
                        </TabPane>
                        <TabPane tab="注册" key="2">
                            <div className='login'>
                                <p className='label'>邀请人会员编号或地址</p>
                                <Input value={regAccount} onChange={this.onRegChange} onKeyDown={this.onKeyReg} />
                                <Button type="primary" onClick={() => this.onRegister()}>注册</Button>
                            </div>
                        </TabPane>
                    </Tabs>
                    <Divider>联系我们</Divider>
                    <div className='connect'>
                        <a href='http://twitter.com/LeagueofFruit'>
                            <img src={require('../../static/img/icon_log_twitter_default.png')} alt='推特' title='twittwe'></img>
                        </a>
                        <a href='http://github.com/LeagueofFruit'>
                            <img src={require('../../static/img/icon_log_github_default.png')} alt='Github' title='Github'></img>
                        </a>
                        <img src={require('../../static/img/icon_log_dianbao_default.png')}></img>
                        <img src={require('../../static/img/icon_log_email_default.png')}></img>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;