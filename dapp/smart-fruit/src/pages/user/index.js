import React, { Component,Fragment } from 'react';
import Buy from './Buy';
import store from '../../store/index';
import { showAccount, showReferrals, showTransactions} from '../../store/actionCreators';

import './user.css';

import config from "../../ethereum/helper/config.js";
import Instance from '../../ethereum/instance';
import Gas from '../../ethereum/gas';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;
const gas = new Gas();

class UserInfo extends Component {
    constructor(props) {
        super(props);
        // this.state = { 
        //     list :[{id: '0', state: '0', address: '0xasd...asd'}],
        //     transactionList: [],
        //     showBuy :false
        //  }
         this.state=store.getState();
         this.storeChange = this.storeChange.bind(this);
         store.subscribe(this.storeChange);

         this.onShow = this.onShow.bind(this);
         this.withdrawIncome = this.withdrawIncome.bind(this);
         this.withdrawcCash = this.withdrawcCash.bind(this);
    }
  
    storeChange(){
        this.setState(store.getState());
    }

    async componentDidMount() {
        const address = sessionStorage.getItem('address');
        if(address == null || address == "") {
            // console.log('请先登录!');
            alert('请先登录!');
            this.props.history.push("/smartFruit/login");
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

        // 获取用户信息
        this.getUserInfo(address);

        // 获取下级信息
        this.getUserReferrals(address);

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
                web3.utils.fromWei(userAccount[0], 'ether'), 
                web3.utils.fromWei(userAccount[1], 'ether'), 
                web3.utils.fromWei(userAccount[2], 'ether'), 
                web3.utils.fromWei(userAccount[3], 'ether'),
                user[1], 
                user[3],
                address.substr(0,10).concat('...').concat(address.substr(30))
            );
    
            store.dispatch(action);
   
            // this.setState({
            //     member: web3.utils.fromWei(userAccount[0], 'ether'), 
            //     promotion: web3.utils.fromWei(userAccount[1], 'ether'), 
            //     lottery: web3.utils.fromWei(userAccount[2], 'ether'), 
            //     cash: web3.utils.fromWei(userAccount[3], 'ether')
            // });
        } catch(e) {
            alert('获取用户信息失败!信息:'+e.message);
        }
    }

    // 获取下级信息
    async getUserReferrals(address) {
        try {
            let userReferrals = await instance.methods.getUserReferrals_UI(address).call();

            var list = [];
            for(var i = 0; i < userReferrals.length; i++) {
                let userReferral = userReferrals[i];
                // 获取编号(2字节)
                let id = web3.utils.hexToNumberString(userReferral.substr(0, 6));

                // 获取状态(1字节)
                let state = web3.utils.hexToNumberString('0x'+userReferral.substr(6, 2));

                // 获取地址(20字节)
                let address = web3.utils.toHex('0x'+userReferral.substr(8, 40));
                
                list.push({id: id, state: state, address: address.substr(0,5).concat('...').concat(address.substr(35))});
            }
            
            // this.setState({list:list});       
            const action = showReferrals(list);
    
            store.dispatch(action); 
        } catch(e) {
            alert('获取下级信息失败!信息:'+e.message);
        }
    }

    // 获取交易记录
    async getAccountPromotions(address) {
        try {
            // 获取推广收入
            let accountPromotions = await instance.methods.getAccountPromotions_UI(address).call();
            // 获取奖池收入
            let accountLotterys = await instance.methods.getAccountLotterys_UI(address).call();
            
            accountPromotions = accountPromotions.concat(accountLotterys);
            
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

            let transactionList = [];
            for(var i = 0; i < accountPromotions.length; i++) {
                let accountPromotion = accountPromotions[i];
                // 获取收入类型(1会员收入、2推广收入、3奖池收入 1字节)
                let kind = web3.utils.hexToNumberString(accountPromotion.substr(0, 4));

                // 获取冻结状态(1冻结,0解冻 1字节)
                let freezeStatus = web3.utils.hexToNumberString('0x'+accountPromotion.substr(4, 2));

                // 获取发起方id(4字节)
                let fromid = web3.utils.hexToNumberString('0x'+accountPromotion.substr(6, 8));

                // 获取冻结到期时间(8字节)
                let freezeTime = web3.utils.hexToNumberString('0x'+accountPromotion.substr(14, 16));

                // 获取金额,单位wei(16字节)
                let value = web3.utils.fromWei(web3.utils.hexToNumberString('0x'+accountPromotion.substr(30, 32)), 'ether');

                // 获取备用(2字节)
                let bak = web3.utils.hexToNumberString('0x'+accountPromotion.substr(62, 4));
                
                transactionList.push({
                    kind: kind, 
                    freezeStatus: freezeStatus, 
                    fromid: fromid,
                    freezeTime: format(freezeTime*1000, 'yyyy-MM-dd HH:mm:ss'),
                    value: value,
                    bak: bak
                });
            }

            // this.setState({transactionList: transactionList});   
            const action = showTransactions(transactionList);
    
            store.dispatch(action); 
        } catch(e) {
            alert('获取交易记录失败!信息:'+e.message);
        }
    }

    // 提现至可用余额
    async withdrawIncome() {
        const address = sessionStorage.getItem('address');
        try {
            if(address == null || address == "") {
                // console.log('请先登录!');
                alert('请先登录!');
                this.props.history.push("/smartFruit/login");
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

            // 获取提现至可用余额所需的 Gas 值
            let estimateGas = await gas.getWithdrawIncomeGas(address);

            // 提现至可用余额
            const accounts = await web3.eth.getAccounts();
            let result = await instance.methods.withdrawIncome_UI(address).send({
                from: accounts[0],
                gas: estimateGas
            });

            alert('提取成功!');

        } catch(e) {
            alert('提取收入失败!信息:'+e.message);
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
            if(address == null || address == "") {
                // console.log('请先登录!');
                alert('请先登录!');
                this.props.history.push("/smartFruit/login");
                return;
            }

            // 判断获取合约实例是否正确
            if(instanceObj.messageStr != null) {
                console.log(instanceObj.messageStr);
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
            
            const accounts = await web3.eth.getAccounts();
            if(address != accounts[0]) {
                // console.log('请切换 Metamask 账户至当前登录账户!');
                alert('请切换 Metamask 账户至当前登录账户!');
                return;
            }

            // 获取提现至可用余额所需的 Gas 值
            let estimateGas = await gas.getWithdrawcCashGas(address);

            // 提现至可用余额
            let result = await instance.methods.withdrawcCash_UI(address).send({
                from: accounts[0],
                gas: estimateGas
            });
            alert('提现成功!');
        } catch(e) {
            alert('提现失败!信息:'+e.message);
        }

        // 获取用户信息
        this.getUserInfo(address);

        // 获取交易记录
        this.getAccountPromotions(address);

    }

    onShow(){
        this.setState({
            showBuy : !this.state.showBuy
        })
    }
    // 获取收入类型(1会员收入、2推广收入、3奖池收入 1字节)
    getTransFrom(state){
        let html = '';
        if(state == 1){
            html='<span class="invalid">会员收入</span>';
        }else if(state == 2){
            html='<span class="valid">推广收入</span>';
        }else if(state == 3){
            html='<span class="active">奖池收入</span>';
        }else{
            html='<span >-</span>';
        }
        return html;
    }
    getState(state){
        let html = '';
        if(state == 0){
            html='<span class="invalid">无效</span>';
        }else if(state == 1){
            html='<span class="valid">有效</span>';
        }else if(state == 2){
            html='<span class="active">激活</span>';
        }else if(state == 3){
            html='<span class="senior">高级</span>';
        }else if(state == 4){
            html='<span class="frozen">冻结</span>';
        }else{
            html='<span >-</span>';
        }
        return html;
    }
    render() { 
        const { showBuy } = this.state;

        // 判断交易记录是否为空
        var transactionList = null;
        
        if(this.state.transactionList.length == 0 || this.state.transactionList[0].kind == 0) {
            transactionList = <div className="transation-none" key="0">暂无数据</div>;
        } else {
            transactionList = this.state.transactionList.map((item,index)=>{
                return (
                    <div className="transation-item" key={item+index}>
                        <span>{item.fromid}</span>
                        <span dangerouslySetInnerHTML={{__html: this.getTransFrom(item.kind)}}></span>
                        <span>{item.value} ETH</span>
                        <span>{item.freezeTime}</span>
                    </div>
                )
            })
        }

        // 判断我的下级是否为空
        var list = null;
        if(this.state.list.length == 0 || this.state.list[0].id == 0) {
            list = <div className="transation-none" key="0">暂无数据</div>;
        } else {
            list = this.state.list.map((item,index)=>{
                const html = this.getState(item.state)
                return (
                    <div className="child-item" key={item+index}>
                        <div className="item-head">
                            <img  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                        </div>
                        <div className="item-body">
                            <div className="item-no">
                                <span>编号：</span>
                                <span>{item.id}</span>
                            </div>
                            <div className="item-address">
                                <span>地址：</span>
                                <span>{item.address}</span>
                            </div>
                            <div className="item-state">
                                <span>状态：</span>
                                <span dangerouslySetInnerHTML={{__html: html}}></span>
                            </div>
                        </div>
                    </div>
                )
            })
        }

        return ( 
            <Fragment>
                <div className="main-div user-div">
                    {/* <div className="user-head"></div> */}
                    {/* 用户信息 */}
                    <div className="info-div">
                        <div className="user-photo">
                            <img  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                        </div>
                        <div className="user-income">
                            <div className="income-item">
                                <i className="income-icon user-base-icon"></i>
                                <p >会员状态：<span dangerouslySetInnerHTML={{__html: this.getState(this.state.userState)}}></span></p>
                                <p>水果数：{this.state.userFruitCount}</p>
                                <p>可用余额：{this.state.cash} ETH</p>
                                <p><button className="income-button" onClick={this.withdrawIncome}>提现至可用余额</button>  <button className="income-button" onClick={this.withdrawcCash}>提现至账户</button></p>
                            </div>
                            <div className="income-item">
                                <i className="income-icon member-icon"></i>
                                <p>用户地址：{this.state.userAddress}</p>
                                <p>会员收入：{this.state.member} ETH</p>
                                <p>推广收入：{this.state.promotion} ETH</p>
                                <p>奖池收入：{this.state.lottery} ETH</p>
                            </div>
                            {/* <div className="income-item">
                                <i className="income-icon extension-icon"></i>
                                <p>推广收入：1000</p>
                                <p>累积推广收入：1000</p>
                            </div>
                            <div className="income-item">
                                <i className="income-icon prize-icon"></i>
                                <p>奖池收入：1000</p>
                                <p>累积奖池收入：1000</p>
                            </div> */}
                        </div>
                        <div className="buy-btn-div">
                            <div className="buy-btn" onClick={()=>this.onShow()}>BUY</div>
                        </div>
                    </div>
                    {/* 子级 */}
                    <div className="child-div">
                        <div className="title-div">我的下级</div>
                        {
                            // this.state.list.map((item,index)=>{
                            //     const html = this.getState(item.state)
                            //     return (
                            //         <div className="child-item" key={item+index}>
                            //             <div className="item-head">
                            //                 <img  src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                            //             </div>
                            //             <div className="item-body">
                            //                 <div className="item-no">
                            //                     <span>编号：</span>
                            //                     <span>{item.id}</span>
                            //                 </div>
                            //                 <div className="item-address">
                            //                     <span>地址：</span>
                            //                     <span>{item.address}</span>
                            //                 </div>
                            //                 <div className="item-state">
                            //                     <span>状态：</span>
                            //                     <span dangerouslySetInnerHTML={{__html: html}}></span>
                            //                 </div>
                            //             </div>
                            //         </div>
                            //     )
                            // })
                            list
                        }
                        
                    </div>

                    {/* 交易记录 */}
                    <div className="transation-div">
                        <div className="title-div">交易记录</div>
                        <div className="transation-content">
                            <div className="transation-head">
                                <span>来源</span>
                                <span>类型</span>
                                <span>金额</span>
                                <span>时间</span>
                            </div>
                            {
                                // this.state.transactionList.map((item,index)=>{
                                //     return (
                                //         <div className="transation-item" key={item+index}>
                                //             <span>{item.fromid}</span>
                                //             <span dangerouslySetInnerHTML={{__html: this.getTransFrom(item.kind)}}></span>
                                //             <span>{item.value} ETH</span>
                                //             <span>{item.freezeTime}</span>
                                //         </div>
                                //     )
                                // })
                                transactionList
                            
                            }
                            
                        </div>
                    </div>
                </div>
                <Buy showBuy = {showBuy} onShow = {this.onShow} 
                     getUserInfo = {this.getUserInfo} getAccountPromotions = {this.getAccountPromotions} 
                     referralsCount={this.state.list.length} userFruitCount={this.state.userFruitCount} />
            </Fragment>
         );
    }
}
 
export default UserInfo;