package com.test.email;

import java.util.Date;

public class TestSendEmail {
	
	public static void main(String[] args) {
		MailSenderInfo mailInfo = new MailSenderInfo();
        // 邮箱代理服务器 网易的163代理为smtp.163.com
        mailInfo.setMailServerHost("smtp.163.com");
        // 设定邮箱代理服务器端口号
        mailInfo.setMailServerPort("25");
        // 身份验证
        mailInfo.setValidate(true);
        // 发件人
        mailInfo.setFromAddress("sheng_yj888@163.com");
        // 收件人
        mailInfo.setToAddress("1243635038@qq.com");
        // 主题
        mailInfo.setSubject("Verification code");
        // 内容
        mailInfo.setContent("Verification code"+new Date().toString());
        MailSender.sendHtmlMail(mailInfo);
	}

}
