import {
  SHOW_ACCOUNT,
  SHOW_REFERRALS,
  SHOW_TRANSACTIONS,
  SHOW_LOTTERY_TRANSACTIONS
} from "./actionTypes";


export const showAccount = (member, promotion, lottery, cash, userID, userState, userFruitCount, userAddress) => ({
  type: SHOW_ACCOUNT,
  member: member, 
  promotion: promotion, 
  lottery: lottery, 
  cash: cash,
  userID: userID,
  userState: userState, 
  userFruitCount: userFruitCount, 
  userAddress: userAddress
});

export const showReferrals = (list) => ({
  type: SHOW_REFERRALS,
  list: list
});

export const showTransactions = (promotionTransList) => ({
  type: SHOW_TRANSACTIONS,
  promotionTransList: promotionTransList
});

export const showLotteryTransactions = (lotteryTransList) => ({
  type: SHOW_LOTTERY_TRANSACTIONS,
  lotteryTransList: lotteryTransList
});