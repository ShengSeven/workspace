package io.renren.modules.ethjava.utils;

import java.math.BigInteger;

public class TransactionEntity {


    /**
     * 钱包地址
     */
    private String payAddr;

    /**
     * 钱包文件
     */
    private String keyStore;

    /**
     * 钱包私钥
     */
    private String walletSecretKey ;

    public String getPayAddr() {
        return payAddr;
    }

    public String getKeyStore() {
        return keyStore;
    }

    public String getWalletSecretKey() {
        return walletSecretKey;
    }

    public void setPayAddr(String payAddr) {
        this.payAddr = payAddr;
    }

    public void setKeyStore(String keyStore) {
        this.keyStore = keyStore;
    }

    public void setWalletSecretKey(String walletSecretKey) {
        this.walletSecretKey = walletSecretKey;
    }
}
