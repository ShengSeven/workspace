import InstanceOper from './instance';
const etherAbi = require('ethereumjs-abi');
// const InstanceOper = require('./instance');
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

  // 获取注册所需的 gas值
  async getRegisterUserGas(referrerID) {
    // if(null != instance.messageStr) {
    //   this.messageStr = web3Oper.messageStr;
    //   return null;
    // }

    // 2. 获取 gas值，普通转账交易
    let money = this.web3.utils.toWei("0.5", "ether");
    let accounts = await this.web3.eth.getAccounts();
    let paramsData = await etherAbi.rawEncode(["uint"], [referrerID]).toString('hex');
    let funData = '0x1bbfae0e'+paramsData;//this.contract.registerUser.getData(referrerID);

    let estimateGas = await this.web3.eth.estimateGas({
        to: config.contractAddress,
        data: funData,
        from: accounts[0],
        value: money
    });

    return estimateGas;
  }

  // 获取购买等级所需的 gas值
  async getBuyLevelGas(level, money) {
    // if(null != instance.messageStr) {
    //   this.messageStr = web3Oper.messageStr;
    //   return null;
    // }

    // 2. 获取 gas值，普通转账交易
    let accounts = await this.web3.eth.getAccounts();
    let paramsData = await etherAbi.rawEncode(["uint"], [level]).toString('hex');
    let funData = '0xf6838a72'+paramsData;//this.contract.registerUser.getData(referrerID);

    let estimateGas = await this.web3.eth.estimateGas({
        to: config.contractAddress,
        data: funData,
        from: accounts[0],
        value: money
    });

    return estimateGas;
  }

}

// module.exports = Gas;
export default Gas;
