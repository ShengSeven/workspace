package com.test.email;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;

/**
 * 重写密码验证器,设置发件人邮箱与客户端授权密码
 * @author asus
 *
 */
public class MailAuthenticator extends Authenticator {
	
	@Override
	protected PasswordAuthentication getPasswordAuthentication() {
		// 发件人邮箱
		String username = "sheng_yj888@163.com";
		// 邮箱授权码
		String password = "syjcssqwe1998";
		
		return new PasswordAuthentication(username, password);
	}

}
