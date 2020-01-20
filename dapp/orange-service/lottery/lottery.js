const ethers = require('ethers');
const log4j = require('./log4j');
const config = require('../config/config');

const logger = log4j.log4js.getLogger('lottery');

// 定义合约接口
let abi = [
    "function lotteryTime() public view returns(uint)",
    "function drawLottery_UI() public returns(address)"
];

// 合约地址
let contractAddress = config.contractAddress;

// 设置网络 Provider 信息
let provider = null;
let contract = null;
try {
    if(config.isLocalhost) {
        // 使用本地网络
        provider = new ethers.providers.JsonRpcProvider('http://localhost:7545');
    } else {
        // 使用 ropsten 测试网络
        provider = ethers.getDefaultProvider(config.provider);
    }

    // 使用 Provider 连接合约, 只对合约的可读权限
    contract = new ethers.Contract(contractAddress, abi, provider);
} catch(e) {
    logger.error('获取 provider 失败!信息:'+e.message);
}

if(contract == null) {
    logger.error('获取合约实例失败!合约实例为空');
    return;
}


// 开奖时间
let lotteryTime = 0;
// 获取上一次开奖时间    
async function getLotteryTime() {
    try {
        lotteryTime = await contract.lotteryTime();
        logger.info('上一次开奖时间为:'+lotteryTime);
    } catch(e) {
        logger.error('获取上一次开奖时间失败!信息:'+e.message);
    }
}

// 定时调用合约中的开奖函数
async function task() {
    logger.info('taskNo:'+new Date().getTime());
    logger.info('lottery time:'+lotteryTime);
    
    if(lotteryTime*1000 < new Date().getTime()) {
        logger.info('执行开奖...');
        await drawLottery();
        getLotteryTime();
    }
}

// 开启定时器
async function startLotteryTask() {
    setInterval(task,config.interval);
}

// 调用合约中的开奖函数 D9AF5B4C3108F1116BD6F9B4F43A8DAB5F1E9F1F1F8FC843BA26866212B39C51
async function drawLottery() {
    try {
        // 通过私钥获取签名器 Signer
        let privateKey = config.privateKey;
        let wallet = new ethers.Wallet(privateKey, provider);

        // 使用签名器创建新的合约实例，允许使用可更新状态的方法
        let contractWithSigner = contract.connect(wallet);

        // 调用开奖函数, 接收返回交易编号
        let tx = await contractWithSigner.drawLottery_UI();
        logger.info('交易编号:'+tx.hash);

        // 等待交易完成
        await tx.wait();

        provider.getTransactionReceipt(tx.hash).then((receipt) => {
            if(receipt.status == 1) {
                logger.info('交易执行成功!');
            } else {
                logger.error('交易执行失败!');
            }
        });
    } catch(e) {
        logger.error('调用合约开奖函数失败!信息:'+e.message);
    }

}

module.exports = {
    getLotteryTime,
    startLotteryTask
};