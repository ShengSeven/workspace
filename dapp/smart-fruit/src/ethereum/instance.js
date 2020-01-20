import Web3Oper from './web3';
// const Web3Oper = require('./web3');
const web3Oper = new Web3Oper();
const config = require('./helper/config');
var abi = require('./contracts/SmartFruit_sol_SmartFruit.json');

class Instance {
  constructor() {
    // 提示信息
    this.messageStr = null;
    // 获取 web3
    this.web3 = web3Oper.getWeb3();
  }

  // 获取合约实例
  getInstance() {
    let messageStr = web3Oper.messageStr;

    // 获取 web3失败
    if(null != messageStr) {
      this.messageStr = messageStr;
      return null;
    }else{
      // 判断选择的网络是否一致
      let curNetworkVersion = this.web3.currentProvider.networkVersion;
      curNetworkVersion = typeof curNetworkVersion !== 'undefined' ? curNetworkVersion : 5777;
      if(curNetworkVersion != config.networkVersion) {
        config.networkVersionMap.map(networkVersion => {
          if(networkVersion.id == config.networkVersion) {
              this.messageStr = '请切换至'+networkVersion.name+'!'
           }
        })

        return null;
      }

      // 合约地址
      let contractAddr = config.contractAddress;

      // 构建合约实例
      const instance = new this.web3.eth.Contract(
         abi,
         contractAddr
      );
      
      return instance;
    }
  }

}

export default Instance;
// module.exports = Instance;
