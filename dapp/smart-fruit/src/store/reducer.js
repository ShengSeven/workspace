import {
  SHOW_ACCOUNT,
  SHOW_REFERRALS,
  SHOW_TRANSACTIONS
} from "./actionTypes";

const defaultState = {
  // buy
  num:0,
  payType:1,

  // index
  showBuy :false,
  member: 0, 
  promotion: 0, 
  lottery: 0, 
  cash: 0,
  userState: -1, 
  userFruitCount: 0, 
  userAddress: '0x00000000...000000000000',
  list: [{
    id: 0, 
    state: 0, 
    address: '0x000...0000000'
  }],
  transactionList: [{
    kind: 0, 
    freezeStatus: 0, 
    fromid: 0,
    freezeTime: 0,
    value: 0,
    bak: 0
  }]
};

export default (state = defaultState, action) => {

  // 用户信息
  if (action.type === SHOW_ACCOUNT) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.member = action.member;
    newState.promotion = action.promotion;
    newState.lottery = action.lottery; 
    newState.cash = action.cash;
    newState.userState = action.userState;
    newState.userFruitCount = action.userFruitCount;
    newState.userAddress = action.userAddress;
    return newState;
  }

  // 下级信息
  if (action.type === SHOW_REFERRALS) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.list = action.list;
    return newState;
  }

  // 交易记录信息
  if (action.type === SHOW_TRANSACTIONS) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.transactionList = action.transactionList;
    return newState;
  }

  return state;
};
