import InstanceOper from './instance';
// const InstanceOper = require('./instance');
const etherAbi = require('ethereumjs-abi');
const instance = new InstanceOper();
const config = require('./helper/config');

class Gas {
  constructor() {
    // 提示信息
    this.messageStr = null;
    // 获取合约实例
    this.contract = instance.getInstance();
    // 通过合约实例获取 web3
    this.web3 = instance.web3;
  }

  // 获取注册所需的 gas 值
  async getRegisterUserGas(referrerID, account, money) {
    let funNameData = this.contract.methods.registerUser_UI(referrerID)._method.signature;//'0xb8647c1c';
    let paramsData = await etherAbi.rawEncode(["uint16"], [referrerID]).toString('hex');
    let funData = funNameData + paramsData;
    
    let estimateGas = await this.web3.eth.estimateGas({
        to: config.contractAddress,
        data: funData,
        from: account,
        value: money
    });

    return estimateGas;
  }

  // 获取提现至可用余额所需的 gas 值
  async getWithdrawIncomeGas(account) {
    let funNameData = this.contract.methods.withdrawIncome_UI(account)._method.signature;
    let paramsData = await etherAbi.rawEncode(["address"], [account]).toString('hex');
    let funData = funNameData + paramsData;
    
    let estimateGas = await this.web3.eth.estimateGas({
        to: config.contractAddress,
        data: funData,
        from: account
    });

    return estimateGas+10000;
  }

  // 获取提现至账户所需的 gas 值
  async getWithdrawcCashGas(account) {
    let funNameData = this.contract.methods.withdrawcCash_UI(account)._method.signature;
    let paramsData = await etherAbi.rawEncode(["address"], [account]).toString('hex');
    let funData = funNameData + paramsData;
    
    let estimateGas = await this.web3.eth.estimateGas({
        to: config.contractAddress,
        data: funData,
        from: account
    });

    return estimateGas+10000;
  }

  // 获取购买水果所需的 gas 值
  async getBuyFruitGas(account, num, money) {
    let funNameData = this.contract.methods.buyFruit_UI(account, num)._method.signature;
    let paramsData = await etherAbi.rawEncode(["address", "uint8"], [account, num]).toString('hex');
    let funData = funNameData + paramsData;
    
    let estimateGas = await this.web3.eth.estimateGas({
        to: config.contractAddress,
        data: funData,
        from: account,
        value: money
    });

    return parseInt(estimateGas)+10000;
  }

}

export default Gas;
// module.exports = Gas;
