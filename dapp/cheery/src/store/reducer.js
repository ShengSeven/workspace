import {
  SHOW_ACCOUNT
} from "./actionTypes";

const defaultState = {
  tabIndex : 0,
  currentLevel:0,
  conutReferralsNum:0,
  levels: [],
  showLoad: false
};

export default (state = defaultState, action) => {

  //展示首页账户列表弹出层
  if (action.type === SHOW_ACCOUNT) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.currentLevel = action.currentLevel;
    newState.balance = action.balance;
    return newState;
  }


  return state;
};
