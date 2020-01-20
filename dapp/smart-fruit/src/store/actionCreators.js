import {
  SHOW_ACCOUNT,
  SHOW_REFERRALS,
  SHOW_TRANSACTIONS
} from "./actionTypes";


export const showAccount = (member, promotion, lottery, cash, userState, userFruitCount, userAddress) => ({
  type: SHOW_ACCOUNT,
  member: member, 
  promotion: promotion, 
  lottery: lottery, 
  cash: cash,
  userState: userState, 
  userFruitCount: userFruitCount, 
  userAddress: userAddress
});

export const showReferrals = (list) => ({
  type: SHOW_REFERRALS,
  list: list
});

export const showTransactions = (transactionList) => ({
  type: SHOW_TRANSACTIONS,
  transactionList: transactionList
});
