//合约地址
const DEBUG = false;
const contractAddress = DEBUG?'0x832AEeA5cF1CE30b68b04051Bd0FF49271d0E552':'0xC9B63F537B19eE85A52887c1DC312D05dFfC0DED';//'0xfE2eebfb45755B55391f1c6fe020Ab0242E4FaE4';
const ipAddress = '39.98.92.109:3001';

const networkVersion = DEBUG? 5777:3;
const networkVersionMap = [{id:1, name:'Main以太坊主网络'}, {id:3, name:'Ropsten测试网络'}, {id:5777, name:'Localhost本地测试网络'}];

module.exports = {
    ipAddress: ipAddress,
    contractAddress : contractAddress,
    networkVersionMap : networkVersionMap,
    networkVersion : networkVersion
}
