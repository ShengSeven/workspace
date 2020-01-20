import React, { Component } from 'react';
import store from '../../store/index';

import './buy.css';

import config from "../../ethereum/helper/config.js";
import Instance from '../../ethereum/instance';
import Gas from '../../ethereum/gas';
const instanceObj = new Instance();
const instance = instanceObj.getInstance();
const web3 = instanceObj.web3;
const gas = new Gas();

class Buy extends Component {
    constructor(props) {
        super(props);
        // this.state = { 
        //     num:0,
        //     payType:0
        // }
        this.state = store.getState();
        this.storeChange = this.storeChange.bind(this);
        store.subscribe(this.storeChange);

        // this.onClick = this.onClick.bind(this);
        this.onPayTypeClick = this.onPayTypeClick.bind(this);
    }
 
    storeChange(){
        this.setState(store.getState());
    }

    // onClick(num){
    //     this.setState({num})
    // }
    onPayTypeClick(payType){
        this.setState({payType})
    }
    async onSubmit(){
        const {onShow, getUserInfo, getAccountPromotions, referralsCount, userFruitCount} = this.props
        const { num,payType } = this.state;
        // console.log("购买数量:"+num+",支付方式:"+payType===0?'余额支付':'钱包支付'+",当前水果数:"+userFruitCount+",当前下线数:"+referralsCount);

        if(num == '' || num == 0) {
            // console.log('请输入购买数量!');
            alert('请输入购买数量!');
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

        const address = sessionStorage.getItem('address');
        const accounts = await web3.eth.getAccounts();
        if(address != accounts[0]) {
            // console.log('请切换 Metamask 账户至当前登录账户!');
            alert('请切换 Metamask 账户至当前登录账户!');
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
        if(referralsCount < referralsLimit) {
            if(parseInt(userFruitCount)+parseInt(num) > fruitLevel1) {
                // console.log('您当前只能拥有 '+fruitLevel1+' 个水果, 还可购买 '+(fruitLevel1-userFruitCount)+' 个水果!');
                alert('您当前只能拥有 '+fruitLevel1+' 个水果, 还可购买 '+(fruitLevel1-userFruitCount)+' 个水果!');
                return;
            }
        } else if(referralsCount >= referralsLimit) {
            // 当前下线人数超过 referralsLimit 个
            if(parseInt(userFruitCount)+parseInt(num) > fruitLevel2) {
                // console.log('您当前只能拥有 '+fruitLevel2+' 个水果, 还可购买 '+(fruitLevel2-userFruitCount)+' 个水果!');
                alert('您当前只能拥有 '+fruitLevel2+' 个水果, 还可购买 '+(fruitLevel2-userFruitCount)+' 个水果!');
                return;
            }

        }

        try {
            // 获取水果单价
            let fruitPrice = await instance.methods.FRUIT_PRICE().call();

            let money = num*fruitPrice;

            // 获取购买水果所需的 Gas 值
            let estimateGas = await gas.getBuyFruitGas(address, num, money);
            
            // 钱包支付
            if(payType == 1) {
                await instance.methods.buyFruit_UI(address, num).send({
                    from: accounts[0],
                    value: money,
                    gas: estimateGas
                });
            }
            
            alert('购买成功!');

        } catch(e) {
            // console.log('购买水果失败!信息:'+e.message);
            alert('购买水果失败!信息:'+e.message);
        }

        onShow();
        getUserInfo(address);
        getAccountPromotions(address);
    }

    render() { 
        const { num,payType } = this.state;
        const {showBuy,onShow} = this.props;
        return ( 
            <div className={`buy-main-div ${showBuy?'active':""}`}>
                 <div className="dark" onClick={()=>onShow()}></div>
                <div className="buy-content">
                    <div className="buy-panel">
                        <i className="close-btn" onClick={()=>onShow()}></i>
                        <h2 className="buy-title">购  买  水  果</h2>
                        <div className="buy-div">
                            <div className="buy-text">购买数量</div>
                            <input className="buy-inputNum" type="text" placeholder="请输入购买数量" onChange={
                                event=>this.setState({num:event.target.value})}/>
                            {/* <div className={`buy-item ${num==1?'active':''}`} onClick={()=>this.onClick(1)}>1</div>
                            <div className={`buy-item ${num==5?'active':''}`} onClick={()=>this.onClick(5)}>5</div>
                            <div className={`buy-item ${num==10?'active':''}`} onClick={()=>this.onClick(10)}>10</div> */}
                        </div>
                        <div className="buy-div">
                            <div className="buy-text">支付方式</div>
                            {/* <div className={`pay-item ${payType==0?'active':''}`} onClick={()=>this.onPayTypeClick(0)}><span className="buy-icon balance-icon">余额支付</span></div> */}
                            <div className={`pay-item ${payType==1?'active':''}`} onClick={()=>this.onPayTypeClick(1)}><span className="buy-icon page-icon">钱包支付</span></div>
                        </div>
                        <div className="buy-btn" onClick={()=>this.onSubmit()}>确  定</div>
                        {/* <span className="small-text">返回登录>></span> */}
                    </div>
                </div>
            </div>
         );
    }
}
 
export default Buy;