//合约地址
const contractAddress = '0x0FC5451172167dfce75F2bDc9e7AAee958ae53d1';

const networkVersion = 3;
const networkVersionMap = [{id:1, name:'Main以太坊主网络'}, {id:3, name:'Ropsten测试网络'}, {id:5777, name:'Localhost本地测试网络'}];

module.exports = {
    contractAddress : contractAddress,
    networkVersionMap : networkVersionMap,
    networkVersion : networkVersion
}