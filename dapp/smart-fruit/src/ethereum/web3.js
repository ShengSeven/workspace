// 引入 web3与以太坊交互
const Web3 = require('web3');


class Web3Oper {
  constructor() {
    // 提示信息
    this.messageStr = null;
  }

  getWeb3() {
    var provider;
    // 是否下载 Metamask插件
    if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
      // 新版 Metamask隐私模式问题
      if (window.ethereum) {
        provider = window.ethereum;
        try {
          // 请求用户授权
          // await window.ethereum.enable();
          window.ethereum.enable().then();
        } catch (error) {
          // 用户不授权
          console.error("User denied account access");
          this.messageStr = "授权失败!";
        }
      } else if (window.web3) {   // 旧版 MetaMask
        provider = window.web3.currentProvider;
      }
    } else {
      // provider = new Web3.providers.HttpProvider('http://localhost:7545');
      this.messageStr = "请下载 Metamask!";
      return null;
    }
    return new Web3(provider);
  }

}

export default Web3Oper;
// module.exports = Web3Oper;
