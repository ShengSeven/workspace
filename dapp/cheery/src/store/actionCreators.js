import {
  SHOW_ACCOUNT
} from "./actionTypes";


export const showAccount = (currentLevel,balance) => ({
  type: SHOW_ACCOUNT,
  currentLevel:currentLevel,
  balance:balance
});
