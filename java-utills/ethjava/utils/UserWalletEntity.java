package io.renren.modules.ethjava.utils;

import lombok.Getter;
import lombok.Setter;

/**
 * 用户钱包信息
 * @author king
 * @since Friday
 */
@Getter
@Setter
public class UserWalletEntity {

    /**
     * 用户Id
     */
    private Long userId;

    /**
     * 付款地址
     */
    private String walletAddr;

    /**
     * 钱包密码
     */
    private String walletPassword;

    /**
     * 钱包文件
     */
    private String walletKeyStore;

}
