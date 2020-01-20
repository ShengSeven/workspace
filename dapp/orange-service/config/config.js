// 合约地址 localhost: ropsten: 0xA5B317e92c9E84B4b132F339a4A611E3ff1C86c6
const contractAddress = '0x46C9B2C1C5666C60Cc60dcdA1FC88c33D84A3ea8';


// 是否使用本地网络, true: 使用本地网络, false: 使用 ropsten、main...
const isLocalhost = true;
// 若使用非本地网络, 可以使用任何标准网络名称做参数：
//  - "homestead"
//  - "rinkeby"
//  - "ropsten"
//  - "kovan"
//  - "goerli"
const provider = 'ropsten';

// 私钥 localhost: 6e13055ed6c34c20c83e631e4b4619d5a6e4fcf6d9bde04f6e6ec3fe17f5d99c ropsten: D9AF5B4C3108F1116BD6F9B4F43A8DAB5F1E9F1F1F8FC843BA26866212B39C51
const privateKey = '3d0f711722c0b5d80efffc5f536c130f51066e2f69af0eaccdedcdd259ae3fb2';
// 执行开奖间隔时间 默认是24小时，
const interval = 24*3600*1000;

module.exports = {
    contractAddress : contractAddress,
    isLocalhost : isLocalhost,
    provider: provider,
    privateKey : privateKey,
    interval : interval
}
