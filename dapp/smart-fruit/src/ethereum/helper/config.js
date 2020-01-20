//合约地址
const contractAddress = '0x46C9B2C1C5666C60Cc60dcdA1FC88c33D84A3ea8';
// const ipAddress = 'localhost:3001';

const networkVersion = 5777;
const networkVersionMap = [{id:1, name:'Main以太坊主网络'}, {id:3, name:'Ropsten测试网络'}, {id:5777, name:'Localhost本地测试网络'}];

module.exports = {
    // ipAddress: ipAddress,
    contractAddress : contractAddress,
    networkVersionMap : networkVersionMap,
    networkVersion : networkVersion
}