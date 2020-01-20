package io.renren.modules.ethjava;

import io.renren.modules.app.service.UserService;
import io.renren.modules.ethjava.utils.Environment;
import io.renren.modules.ethjava.utils.UserWalletEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import rx.Subscription;

import java.util.List;
import java.util.ArrayList;

@Component
public class EthTransactionFilter implements ApplicationRunner {

    /**
     * 换算比例(两次)
     */
    final static int scaler = 1000000000;

    /**
     * 用户钱包地址集合(启动时从数据库获取初始化一次)
     */
    public static List<UserWalletEntity> userWalletList = new ArrayList<UserWalletEntity>();

    /**
     * 待确认交易集合(启动时从数据库获取初始化一次)
     */
    //public static List<TxRechargeEntity> pendingTransactionList = new ArrayList<TxRechargeEntity>();

    public static Web3j web3j = null;

    /**
     * 新交易集合(启动时从数据库获取初始化一次)
     */
    //public static List<TxRechargeEntity> newTransactionList = new ArrayList<TxRechargeEntity>();

    @Autowired
    private UserService userService;


    //private TxRechargeService txRechargeService;



    @Override
    public void run(ApplicationArguments applicationArguments){
        initFilter();
    }

    private void initFilter(){

        System.out.println("after system startup .....");
        //初始化用户钱包地址
        /*userWalletList = userService.selectWalletAddrs(0);

        //监听准备中的交易
        pendingTransactionList = txRechargeService.selectList(new EntityWrapper<TxRechargeEntity>().eq("status", 0));*/

        //建立监听
        web3j = Web3j.build(new HttpService(Environment.RPC_URL));
        try{
            System.out.println(web3j.web3ClientVersion().send().getWeb3ClientVersion());
        }catch (Exception ex){
            ex.printStackTrace();
        }
        //待确认交易监听
        pendingTransactionObservableFilter(web3j);
        //新交易监听
        newTransactionFilter(web3j);
        //新区块监听
        //newBlockFilter(web3j);
        /*for (int i = 0; i < walletAddrs.size(); i++){
            System.out.println("walletAddr " + walletAddrs.get(i));
        }
        for (int i = 0; i < txHashes.size(); i++){
            System.out.println("txHashe " + txHashes.get(i));
        }*/
    }

    /**
     * 待确认叫监听
     * @param web3j
     */
    private void pendingTransactionObservableFilter(Web3j web3j){
        //System.out.println("pendingTransactionObservableFilter begin");
        Subscription subscription = web3j.
                pendingTransactionObservable().
                subscribe(transaction -> {
                    /*System.out.println("pending to " + transaction.getTo());
                    System.out.println("pending txHash " + .getHash());
                    System.out.println("confirm number " + transaction.getBlockNumber());
                    System.out.println("transtion value " + transaction.getValue());*/
                    //根据系统用户钱包地址判断
                    /*userWalletList.forEach(userWallet -> {

                        if(userWallet.getPayAddr().equals(transaction.getTo()) && transaction.getValue() != new BigInteger("0")){//钱包产生交易
                            System.out.println("pending come in");
                            double value = transaction.getValue().doubleValue() / scaler / scaler;
                            //将txhash放入新交易指定常量中
                            TxRechargeEntity txRechargeEntity = new TxRechargeEntity();
                            txRechargeEntity.setBlockNumber(new BigInteger("0"));
                            txRechargeEntity.setMoney(value);
                            txRechargeEntity.setPayAddr(userWallet.getPayAddr());
                            txRechargeEntity.setTxHash(transaction.getHash());
                            txRechargeEntity.setUserId(userWallet.getUserId());
                            txRechargeEntity.setStatus(0);
                            txRechargeEntity.setCreateTime(new Date());
                            TxRechargeEntity bool = txRechargeService.selectOne(new EntityWrapper<TxRechargeEntity>()
                                    .eq("pay_addr",txRechargeEntity.getPayAddr())
                                    .eq("tx_hash", txRechargeEntity.getTxHash())
                                    .eq("user_id", txRechargeEntity.getUserId()));
                            if(ObjectUtil.isNull(bool)){
                                txRechargeService.insert(txRechargeEntity);
                                pendingTransactionList.add(txRechargeEntity);
                            }
                        }
                    });*/
                });

    }


    /**
     * 新交易监听
     * @param web3j
     */
    private void newTransactionFilter(Web3j web3j){
        //System.out.println("newTransactionFilter begin");
            Subscription subscription = web3j.
                    transactionObservable().
                    subscribe(transaction -> {

                        /*System.out.println("transaction to " + transaction.getTo());
                        System.out.println("transaction txHash " + transaction.getHash());
                        System.out.println("confirm number " + transaction.getBlockNumber());
                        System.out.println("transtion value " + transaction.getValue());
                        System.out.println("scaler value " + transaction.getValue().doubleValue() / scaler / scaler);
                        pendingTransactionList.forEach(pendingTransaction -> {
                            if(pendingTransaction.getTxHash().equals(transaction.getHash()) && transaction.getValue().intValue() != 0){//pendingTransaction confirm
                                System.out.println("transaction come in");
                                //将交易对应key状态改变,进行后续计算
                                //double value = transaction.getValue().doubleValue() / scaler / scaler;
                                //newTransactionList.add(pendingTransaction);
                                //pendingTransactionList.remove(pendingTransaction);
                                //appApiService.settlement(pendingTransaction,value);
                                userService.userRecharge(pendingTransaction, transaction.getBlockNumber());
                            }
                        });
                        //System.out.println("----------------------");*/
                    });

    }

    /**
     * 新区块监听
     * @param web3j
     */
    /*private void newBlockFilter(Web3j web3j) {
        Subscription subscription = web3j.
                blockObservable(false).
                subscribe(block -> {
                    System.out.println("new block come in");
                    System.out.println("block number" + block.getBlock().getNumber());
                    BigInteger cutnumber = block.getBlock().getNumber().subtract(new BigInteger("12"));
                    newTransactionList.forEach(newTransaction -> {
                        if(cutnumber.compareTo(newTransaction.getBlockNumber()) >= 0){
                            //12个区块确认完毕

                        }
                    });
                });
    }*/


}
