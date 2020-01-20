import React, { Component } from 'react';
import { Button, Tabs, Drawer, Table, Empty, Input, message } from 'antd'
import "antd/dist/antd.css"
import './index.css'
import Loading from '../common/loading'
import Comfirm from '../common/confirm'

import store from '../../store/index';
import { showAccount, showReferrals, showTransactions, showLotteryTransactions } from '../../store/actionCreators';

import config from "../../ethereum/helper/config.js";
import Instance from '../../ethereum/instance';
import Gas from '../../ethereum/gas';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;
const gas = new Gas();

const { TabPane } = Tabs;
const columns = [
    {
        title: '来源',
        dataIndex: 'fromid',
        // render: text => <a>{text}</a>,
    },
    {
        title: '类型',
        dataIndex: 'freezeStatus',
    },
    {
        title: '金额',
        dataIndex: 'value',
    },
    {
        title: '时间',
        dataIndex: 'freezeTime',
    },
];
// const data = [
//     {
//         key: '1',
//         name: 'John Brown',
//         age: 32,
//         address: 'New York No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '2',
//         name: 'Jim Green',
//         age: 42,
//         address: 'London No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '3',
//         name: 'Joe Black',
//         age: 32,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '4',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '5',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '6',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '7',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '8',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '9',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '10',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '11',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '12',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '13',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '14',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
//     {
//         key: '15',
//         name: 'Disabled User',
//         age: 99,
//         address: 'Sidney No. 1 Lake Park',
//         date: '2020-10-11 12:24:56'
//     },
// ];
class Index extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     buyvisible: false,
        //     showLoad: false,
        //     showConfirm: false,
        //     confirmName: ''
        // }
        this.state = store.getState();
        this.storeChange = this.storeChange.bind(this);
        store.subscribe(this.storeChange);

        // this.withdrawIncome = this.withdrawIncome.bind(this);
        // this.withdrawcCash = this.withdrawcCash.bind(this);
    }

    storeChange() {
        this.setState(store.getState());
    }

    async componentDidMount() {
        const address = sessionStorage.getItem('address');
        if (address == null || address == "") {
            message.error('请先登录!');
            this.props.history.push("/smartOrange/login");
            return;
        }

        // 判断获取合约实例是否正确
        if (instanceObj.messageStr != null) {
            message.error(instanceObj.messageStr);
            return;
        }

        // 判断选择的网络是否一致
        let curNetworkVersion = web3.currentProvider.networkVersion;
        curNetworkVersion = typeof curNetworkVersion !== 'undefined' ? curNetworkVersion : 5777;
        if (curNetworkVersion != config.networkVersion) {
            config.networkVersionMap.map(networkVersion => {
                if (networkVersion.id == config.networkVersion) {
                    message.error('请切换至' + networkVersion.name + '!');
                    return;
                }
            })
            return;
        }

        // 获取用户信息
        this.getUserInfo(address);

        // 获取下级信息
        this.getUserReferrals(address);

        // 获取推广收入交易记录
        this.getAccountPromotions(address);

        // 获取奖池收入交易记录
        this.getAccountLotterys(address);
    }

    // 显示购买水果弹出层
    showDrawer = () => {
        this.setState({
            num: '',
            buyvisible: true,
        });
        document.body.style.overflow = 'hidden'
    };
    // 关闭购买水果弹出层
    onClose = () => {
        this.setState({ 
            buyvisible: false,
        });
        document.body.style.overflow = 'scroll'
    };
    //显示 提取/提现 确认框弹出层
    showConfirm = (e) => {
        // e 为0时表示 提现 ，为 1 时表示提取
        this.setState({
            showConfirm: true,
        });
        document.body.style.overflow = 'hidden'
        if (e === 0) {
            this.state.confirmName = '提现'
        } else if (e === 1) {
            this.state.confirmName = '提取'
        }
        // console.log(e)
    };
    //关闭 提取/提现 确认框弹出层
    closeConfirm = () => {
        this.setState({
            showConfirm: false,
        });
        document.body.style.overflow = 'scroll'
    };
    // 确认 提现/提取
    confirmExtract() {
        this.setState({
            showConfirm: false,
            showLoad: true,
        });
        document.body.style.overflow = 'hidden'
        if (this.state.confirmName == '提取') {
            this.withdrawIncome();
        } else if (this.state.confirmName == '提现') {
            this.withdrawcCash();
        }
    }

    // 退出登录
    logout() {
        sessionStorage.removeItem("userID")
        sessionStorage.removeItem("address")
        this.props.history.push("/smartOrange/login");
    }
    // 提现至可用余额
    async withdrawIncome() {
        const address = sessionStorage.getItem('address');
        try {
            if (address == null || address == "") {
                message.error('请先登录!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                this.props.history.push("/smartOrange/login");
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

            // 获取提现至可用余额所需的 Gas 值
            let estimateGas = await gas.getWithdrawIncomeGas(address);

            // 提现至可用余额
            const accounts = await web3.eth.getAccounts();
            let result = await instance.methods.withdrawIncome_UI(address).send({
                from: accounts[0],
                gas: estimateGas
            });

            message.success('提取至可用余额成功!');

            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        } catch (e) {
            message.error('提取至可用余额失败!');
            console.log('提取至可用余额失败!信息:' + e.message);
            
            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        }

        // 获取用户信息
        this.getUserInfo(address);

        // 获取交易记录
        this.getAccountPromotions(address);
    }

    // 提现至账户
    async withdrawcCash() {
        const address = sessionStorage.getItem('address');
        try {
            if (address == null || address == "") {
                message.error('请先登录!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                this.props.history.push("/smartOrange/login");
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

            const accounts = await web3.eth.getAccounts();
            if (address != accounts[0]) {
                message.error('请切换 Metamask 账户至当前登录账户!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                return;
            }

            // 获取提现至可用余额所需的 Gas 值
            let estimateGas = await gas.getWithdrawcCashGas(address);

            // 提现至可用余额
            let result = await instance.methods.withdrawcCash_UI(address).send({
                from: accounts[0],
                gas: estimateGas
            });

            message.success('提现成功!');

            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        } catch (e) {
            message.error('提现失败!');
            console.log('提现失败!信息:' + e.message);
            
            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        }

        // 获取用户信息
        this.getUserInfo(address);

        // 获取交易记录
        this.getAccountPromotions(address);
    }

    // 获取用户信息
    async getUserInfo(address) {
        try {

            // 获取用户信息(会员状态、水果数、用户地址)
            let user = await instance.methods.getUserInfo_UI(web3.utils.toHex(address)).call();
            // this.setState({userState: user[1], userFruitCount: user[3], userAddress: address.substr(0,10).concat('...').concat(address.substr(30))});

            // 获取会员收入、推广收入、奖池收入、可用余额
            let userAccount = await instance.methods.getUserAccount_UI(web3.utils.toHex(address)).call();
            const action = showAccount(
                web3.utils.fromWei(userAccount[0], 'ether').substr(0, 6),
                web3.utils.fromWei(userAccount[1], 'ether').substr(0, 6),
                web3.utils.fromWei(userAccount[2], 'ether').substr(0, 6),
                web3.utils.fromWei(userAccount[3], 'ether').substr(0, 6),
                user[0],
                user[1],
                user[3],
                address.substr(0, 10).concat('...').concat(address.substr(30))
            );

            store.dispatch(action);

            // this.setState({
            //     member: web3.utils.fromWei(userAccount[0], 'ether'), 
            //     promotion: web3.utils.fromWei(userAccount[1], 'ether'), 
            //     lottery: web3.utils.fromWei(userAccount[2], 'ether'), 
            //     cash: web3.utils.fromWei(userAccount[3], 'ether')
            // });
        } catch (e) {
            message.error('获取用户信息失败!请重新登录!');
            console.log('获取用户信息失败!信息:' + e.message);
        }
    }

    // 获取下级信息
    async getUserReferrals(address) {
        try {
            let userReferrals = await instance.methods.getUserReferrals_UI(address).call();

            var list = [];
            for (var i = 0; i < userReferrals.length; i++) {
                let userReferral = userReferrals[i];
                // 获取编号(2字节)
                let id = web3.utils.hexToNumberString(userReferral.substr(0, 6));

                // 获取状态(1字节)
                let state = web3.utils.hexToNumberString('0x' + userReferral.substr(6, 2));

                // 获取地址(20字节)
                let address = web3.utils.toHex('0x' + userReferral.substr(8, 40));

                list.push({ id: id, state: state, address: address.substr(0, 5).concat('...').concat(address.substr(35)) });
            }

            // this.setState({list:list});       
            const action = showReferrals(list);

            store.dispatch(action);
        } catch (e) {
            message.error('获取下级信息失败!请重新登录!');
            console.log('获取下级信息失败!信息:' + e.message);
        }
    }

    // 获取 推广收入 交易记录
    async getAccountPromotions(address) {
        try {
            // 获取推广收入
            let accountPromotions = await instance.methods.getAccountPromotions_UI(address).call();

            // 解析交易记录
            let promotionTransList = this.parseTransactions(accountPromotions, '推广收入');

            // this.setState({promotionTransList: promotionTransList});   
            const action = showTransactions(promotionTransList);

            store.dispatch(action);

        } catch (e) {
            message.error('获取推广收入交易记录失败!请重新登录!');
            console.log('获取推广收入交易记录失败!信息:' + e.message);
            
        }
    }

    // 获取 奖池收入 交易记录
    async getAccountLotterys(address) {
        try {
            // 获取奖池收入
            let accountLotterys = await instance.methods.getAccountLotterys_UI(address).call();

            // 解析交易记录
            let lotteryTransList = this.parseTransactions(accountLotterys, '奖池收入');

            // this.setState({lotteryTransList: lotteryTransList});   
            const action = showLotteryTransactions(lotteryTransList);

            store.dispatch(action);

        } catch (e) {
            message.error('获取奖池收入交易记录失败!');
            console.log('获取奖池收入交易记录失败!信息:' + e.message);
        }
    }

    // 解析交易记录
    parseTransactions(accountTrans, freezeStatusStr) {
        var format = function (time, format) {
            var t = new Date(time);
            var tf = function (i) { return (i < 10 ? '0' : '') + i };
            return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
                switch (a) {
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

        let transactionsList = [];
        for (var i = 0; i < accountTrans.length; i++) {
            let accountTran = accountTrans[i];
            // 获取收入类型(1会员收入、2推广收入、3奖池收入 1字节)
            let kind = web3.utils.hexToNumberString(accountTran.substr(0, 4));

            // 获取冻结状态(1冻结,0解冻 1字节)
            let freezeStatus = web3.utils.hexToNumberString('0x' + accountTran.substr(4, 2));

            // 获取发起方id(4字节)
            let fromid = web3.utils.hexToNumberString('0x' + accountTran.substr(6, 8));

            // 获取冻结到期时间(8字节)
            let freezeTime = web3.utils.hexToNumberString('0x' + accountTran.substr(14, 16));

            // 获取金额,单位wei(16字节)
            let value = web3.utils.fromWei(web3.utils.hexToNumberString('0x' + accountTran.substr(30, 32)), 'ether');

            // 获取备用(2字节)
            let bak = web3.utils.hexToNumberString('0x' + accountTran.substr(62, 4));

            transactionsList.push({
                key: i,
                kind: kind,
                freezeStatus: freezeStatusStr,
                fromid: fromid,
                freezeTime: format(freezeTime * 1000, 'yyyy-MM-dd HH:mm:ss'),
                value: value
                // bak: bak
            });
        }

        return transactionsList;
    }

    async buyFruit() {
        this.setState({
            buyvisible: false,
            showLoad: true
        });
        document.body.style.overflow = 'hidden'
        const { num, list, userFruitCount } = this.state;
        const referralsCount = list.length;

        if (num == '' || num == 0) {
            message.error('请输入购买数量!');
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

        const address = sessionStorage.getItem('address');
        const accounts = await web3.eth.getAccounts();
        if (address != accounts[0]) {
            message.error('请切换 Metamask 账户至当前登录账户!');
            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
            return;
        }

        // 判断用户输入的水果数是否满足规则
        // 判断当前用户拥有水果数与下线人数是否匹配
        // 获取最大下线数 REFERRALS_LIMIT
        const referralsLimit = 12;// await instance.methods.REFERRALS_LIMIT().call();

        // 获取水果数量限制 FRUIT_LEVEL1, FRUIT_LEVEL2
        const fruitLevel1 = await instance.methods.FRUIT_LEVEL1().call();
        const fruitLevel2 = await instance.methods.FRUIT_LEVEL2().call();

        // 当前下线人数不超过 referralsLimit 个
        if (referralsCount < referralsLimit) {
            if (parseInt(userFruitCount) + parseInt(num) > fruitLevel1) {
                message.error('您当前只能拥有 ' + fruitLevel1 + ' 个水果, 还可购买 ' + (fruitLevel1 - userFruitCount) + ' 个水果!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                return;
            }
        } else if (referralsCount >= referralsLimit) {
            // 当前下线人数超过 referralsLimit 个
            if (parseInt(userFruitCount) + parseInt(num) > fruitLevel2) {
                message.error('您当前只能拥有 ' + fruitLevel2 + ' 个水果, 还可购买 ' + (fruitLevel2 - userFruitCount) + ' 个水果!');
                this.setState({ showLoad: false });
                document.body.style.overflow = 'scroll'
                return;
            }

        }

        try {
            // 获取水果单价
            let fruitPrice = await instance.methods.FRUIT_PRICE().call();

            let money = num * fruitPrice;

            // 获取购买水果所需的 Gas 值
            let estimateGas = await gas.getBuyFruitGas(address, num, money);

            // 钱包支付
            await instance.methods.buyFruit_UI(address, num).send({
                from: accounts[0],
                value: money,
                gas: estimateGas
            });

            message.success('购买成功!');
            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        } catch (e) {
            message.error('购买水果失败!');
            console.log('购买水果失败!信息:' + e.message);
            
            this.setState({ showLoad: false });
            document.body.style.overflow = 'scroll'
        }

        this.getUserInfo(address);
        this.getAccountPromotions(address);
    }

    getState(state) {
        let html = '';
        if (state == 0) {
            html = '无效';
        } else if (state == 1) {
            html = '有效';
        } else if (state == 2) {
            html = '激活';
        } else if (state == 3) {
            html = '高级';
        } else if (state == 4) {
            html = '冻结';
        } else {
            html = '-';
        }
        return html;
    }

    getStateStyle(state) {
        let html = "";
        if (state == 0) {
            html = 'circle circle-invalid';
        } else if (state == 1) {
            html = 'circle circle-valid';
        } else if (state == 2) {
            html = 'circle circle-active';
        } else if (state == 3) {
            html = 'circle circle-highlevel';
        } else if (state == 4) {
            html = 'circle circle-freeze';
        } else {
            html = 'circle circle-freeze';
        }
        return html;
    }

    render() {
        const { showLoad, showConfirm } = this.state

        // 判断我的下级是否为空
        var list = null;
        if (this.state.list.length == 0 || this.state.list[0].id == 0) {
            list = <Empty />;
        } else {
            list = this.state.list.map((item, index) => {
                const state = this.getState(item.state);
                const style = this.getStateStyle(item.state);
                return (
                    <div className='sublist-items' key={item.id}>
                        <div className='top'>
                            <span className='id'>{item.id}</span>
                            <span className='address'>{item.address}</span>
                        </div>
                        <div className='bottom bottom-invalid'>
                            <span className={style}></span>
                            <span>{state}</span>
                        </div>
                    </div>
                )
            })
        }

        return (
            <div className='bg-index'>
                <Loading show={showLoad} />
                {/* <Comfirm show={showConfirm} /> */}
                <div className='content-index'>
                    <div className={this.state.buyvisible ? 'show' : 'none'}>
                        <div className='show-mask' onClick={this.onClose.bind(this)} ></div>
                        <div className='pop-buy'>
                            <p className='title-pop'>购买水果</p>
                            <p className='subtitle'>购买数量</p>
                            <Input value={this.state.num} onChange={
                                event => this.setState({ num: event.target.value })} />
                            {/* <div className='amount-choose'>
                                <span className='amount-normal'>1</span>
                                <span className='amount-normal'>5</span>
                                <span className='amount-active'>10</span>
                            </div> */}
                            {/* <p className='subtitle'>支付方式</p>
                            <div className='pay-type'>
                                <div className='pay-type-normal'>
                                    <img src={require('../../static/img/icon_balance_default.png')}></img>
                                    <span>余额支付</span>
                                </div>
                                <div className='pay-type-choose'>
                                    <img src={require('../../static/img/icon_wallet_selected.png')}></img>
                                    <span>钱包支付</span>
                                </div>
                            </div> */}
                            <Button type="primary" onClick={() => this.buyFruit()}>确定</Button>
                        </div>
                    </div>
                    <div className={this.state.showConfirm ? 'show' : 'none'} >
                        <div className='show-mask' onClick={this.closeConfirm.bind(this)}></div>
                        <div className='pop-buy'>
                            <p className='title-pop'>{this.state.confirmName}</p>
                            <p className='subtitle confirmTitle'>是否确认{this.state.confirmName}</p>
                            <div className='confirmBtn-div'>
                                <Button type="primary" className='confirmBtn cancelBtn' onClick={this.closeConfirm.bind(this)}>取消</Button>
                                <Button type="primary" className='confirmBtn' onClick={this.confirmExtract.bind(this)}>确认</Button>
                            </div>
                        </div>
                    </div>
                    <div className='header'>
                        <img className='logo' src={require('../../static/img/logo_index.png')}></img>
                        <div className='logout-btn' onClick={this.logout.bind(this)}>
                            <img src={require('../../static/img/icon_top_quit.png')}></img>
                            <span>退出登录</span>
                        </div>
                        <div className='top'>
                            <span className='username'>你好, <span>{this.state.userID}</span> !</span>
                            <Button type="primary" onClick={this.showConfirm.bind(this, 0)}>提现</Button>
                        </div>
                        <p className='bottom'>您现在的会员状态 <span className='staus'>{this.getState(this.state.userState)}</span> ,可用 <span className='balance'>{this.state.cash}</span> 余额;购买水果可享受普通用户回报，也可以推荐他人享受推广收入，还可以获得幸运大奖。</p>
                    </div>
                    <div className='assetsList'>
                        <div className='list-items bg-orange'>
                            <div className='top'>
                                <p>可用水果</p>
                                <p> <span>{this.state.userFruitCount}</span> <Button type='primary' className='bg-buy' onClick={this.showDrawer.bind(this)}> 购买</Button> </p>
                                <img src={require('../../static/img/icon_fruit.png')}></img>
                            </div>

                        </div>
                        <div className='list-items bg-yellow'>
                            <div className='top'>
                                <p>会员收入</p>
                                <p> <span>{this.state.member}</span> <Button type='primary' className='bg-extract' onClick={this.showConfirm.bind(this, 1)}>提取</Button> </p>
                                <img src={require('../../static/img/icon_member.png')}></img>
                            </div>
                        </div>
                        <div className='list-items bg-green'>
                            <div className='top'>
                                <p>推广收入</p>
                                <p>{this.state.promotion}</p>
                                <img src={require('../../static/img/icon_sextend.png')}></img>
                            </div>

                        </div>
                        <div className='list-items bg-blue '>
                            <div className='top'>
                                <p>奖池收入</p>
                                <p>{this.state.lottery}</p>
                                <img src={require('../../static/img/icon_reward.png')}></img>
                            </div>

                        </div>
                    </div>
                    <div className='title'>我的下级</div>
                    <div className='subordinate-list'>
                        {list}
                    </div>
                    <div className='title'>交易记录</div>
                    <div className='record'>
                        <Tabs defaultActiveKey="1" >
                            {/* <TabPane tab="会员收入" key="1">
                                <Table
                                    columns={columns}
                                    dataSource={data}
                                    size='small'
                                    align='center'
                                >
                                </Table>
                                <Empty />
                            </TabPane> */}
                            <TabPane tab="推广收入" key="2">
                                {
                                    (this.state.promotionTransList.length == 0 || this.state.promotionTransList[0].kind == 0) ?
                                        <Empty /> : <Table columns={columns} dataSource={this.state.promotionTransList} size='small' align='center'></Table>
                                }
                            </TabPane>
                            <TabPane tab="奖池收入" key="3">
                                {
                                    (this.state.lotteryTransList.length == 0 || this.state.lotteryTransList[0].kind == 0) ?
                                        <Empty /> : <Table columns={columns} dataSource={this.state.lotteryTransList} size='small' align='center'></Table>
                                }
                            </TabPane>
                            {/* <TabPane tab="支出" key="4">
                                <Empty />
                            </TabPane> */}
                        </Tabs>
                    </div>
                </div>
                <footer>
                    <div className='footer'>
                        <span>联系我们</span>
                        <div className='connect-way'>
                            <div>
                                <a href='http://twitter.com/LeagueofFruit' title='twitter'>
                                    <img src={require('../../static/img/icon_bottom_twitter_default.png')}></img>
                                    twitter.com/LeagueofFruit
                                </a>
                            </div>
                            <div>
                                <a href='http://github.com/LeagueofFruit' title='Github'>
                                    <img src={require('../../static/img/icon_bottom_github_default.png')}></img>
                                    github.com/LeagueofFruit
                                </a>
                            </div>
                            <div>
                                <a>
                                    <img src={require('../../static/img/icon_bottom_dianbao_default.png')}></img>
                                    t.me/lof_word
                                </a>
                            </div>
                            <div>
                                <a>
                                    <img src={require('../../static/img/icon_bottom_email_default.png')}></img>
                                    info@lof.cool
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

        );
    }
}

export default Index;