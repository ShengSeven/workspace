import {
  SHOW_ACCOUNT,
  SHOW_REFERRALS,
  SHOW_TRANSACTIONS,
  SHOW_LOTTERY_TRANSACTIONS
} from "./actionTypes";

const defaultState = {
  // params index
  buyvisible: false,
  showLoad: false,
  showConfirm: false,
  confirmName: '',

  // buy
  num:'',
  payType:1,

  // index
  showBuy :false,
  member: 0, 
  promotion: 0, 
  lottery: 0, 
  cash: 0,
  userID: 0,
  userState: -1, 
  userFruitCount: 0, 
  userAddress: '0x00000000...000000000000',
  list: [{
    id: 0, 
    state: 0, 
    address: '0x000...0000000'
  }],
  promotionTransList: [{
    key: 0,
    kind: 0, 
    freezeStatus: 0, 
    fromid: 0,
    freezeTime: 0,
    value: 0,
    bak: 0
  }],
  lotteryTransList:  [{
    key: 0,
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
    newState.userID = action.userID;
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

  // 推广交易记录信息
  if (action.type === SHOW_TRANSACTIONS) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.promotionTransList = action.promotionTransList;
    return newState;
  }

  // 奖池交易记录信息
  if (action.type === SHOW_LOTTERY_TRANSACTIONS) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.lotteryTransList = action.lotteryTransList;
    return newState;
  }

  return state;
};
