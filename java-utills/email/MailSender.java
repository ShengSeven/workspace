package com.test.email;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Properties;

import javax.activation.CommandMap;
import javax.activation.MailcapCommandMap;
import javax.mail.Address;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

/**
 * 发送邮件
 * @author asus
 *
 */
public class MailSender {

	/**
	 * 以HTML格式发送邮件
	 *
	 * @param mailInfo
	 *            待发送的邮件信息
	 */
	public static boolean sendHtmlMail(MailSenderInfo mailInfo) {
		// 判断是否需要身份认证
		MailAuthenticator authenticator = null;
		Properties pro = mailInfo.getProperties();
		// 如果需要身份认证，则创建一个密码验证器
		if (mailInfo.isValidate()) {
			authenticator = new MailAuthenticator();
		}
		// 根据邮件会话属性和密码验证器构造发送邮件session
		Session sendMailSession = Session.getDefaultInstance(pro, authenticator);
		try {
			// 根据session创建邮件消息
			Message mailMessage = new MimeMessage(sendMailSession);
			// 创建邮件发送者地址
			Address from;
			try {
				// 设置邮箱地址、邮箱标题
				from = new InternetAddress(mailInfo.getFromAddress(), "Verification code");
				
				// 设置邮件消息的发送者
				mailMessage.setFrom(from);
				
				//创建邮件的接收者地址，并设置到邮件消息中
				Address to = new InternetAddress(mailInfo.getToAddress());
				mailMessage.setRecipient(Message.RecipientType.TO, to);
				
				// 设置邮件消息的主题
				mailMessage.setSubject(mailInfo.getSubject());
				
				// 设置邮件消息发送的时间
				mailMessage.setSentDate(new Date());
				
				// MiniMultipart容器类，包含MimeBodyPart类型的对象
				Multipart mainPart = new MimeMultipart();
				
				// 创建一个包含HTML内容的MimeBodyPart
				BodyPart html = new MimeBodyPart();
				
				// 设置HTML内容
				html.setContent("<u>"+mailInfo.getContent()+"</u>", "text/html; charset=utf-8");
				mainPart.addBodyPart(html);
				
				// 将MiniMultipart对象设置为邮件内容
				mailMessage.setContent(mainPart);
				
				// 解决 no object DCH for MIME type multipart/mixed;
				MailcapCommandMap mc = (MailcapCommandMap) CommandMap.getDefaultCommandMap();
				mc.addMailcap("text/html;; x-java-content-handler=com.sun.mail.handlers.text_html");
				mc.addMailcap("text/xml;; x-java-content-handler=com.sun.mail.handlers.text_xml");
				mc.addMailcap("text/plain;; x-java-content-handler=com.sun.mail.handlers.text_plain");
				mc.addMailcap("multipart/*;; x-java-content-handler=com.sun.mail.handlers.multipart_mixed");
				mc.addMailcap("message/rfc822;; x-java-content-handler=com.sun.mail.handlers.message_rfc822");
				CommandMap.setDefaultCommandMap(mc);
				
				// 发送邮件
				Transport.send(mailMessage);
				return true;
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}

		} catch (MessagingException ex) {
			ex.printStackTrace();
		}
		return false;
	}
	
	/**
	 * 以文本格式发送邮件
	 *
	 * @param mailInfo
	 *            待发送的邮件的信息
	 */
//	public boolean sendTextMail(MailSenderInfo mailInfo) {
//		// 判断是否需要身份认证
//		MailAuthenticator authenticator = null;
//		Properties pro = mailInfo.getProperties();
//		if (mailInfo.isValidate()) {
//			// 如需要身份认证，则创建一个密码验证器
//			authenticator = new MailAuthenticator();
//		}
//		// 根据邮件会话属性和密码验证器构造发送邮件的session
//		Session sendMailSession = Session.getDefaultInstance(pro, authenticator);
//		try {
//			// 根据session创建一个邮件消息
//			Message mailMessage = new MimeMessage(sendMailSession);
//			// 创建邮件发送者地址
//			Address from;
//			try {
//				// 设置发件人名称
//				from = new InternetAddress(mailInfo.getFromAddress(), "Verification code");
//				// 设置邮件消息的发送者
//				mailMessage.setFrom(from);
//				// 创建邮件的接收者地址，并设置到邮件消息中
//				if (mailInfo.isSnedToAll()) {
//					 //当前模式为群发
//					 String[] mailToAddress = mailInfo.getToAddresses();  
//				     int len = mailToAddress.length;  
//				     Address to[] = new InternetAddress[len] ;  
//				     for(int i=0;i<len;i++){  
//				          to[i] = new InternetAddress(mailToAddress[i]) ;  
//				     }  
//					mailMessage.setRecipients(Message.RecipientType.TO, to);
//				}else {
//					//非群发
//					Address to = new InternetAddress(mailInfo.getToAddress());
//					mailMessage.setRecipient(Message.RecipientType.TO, to);
//				}
//				// 设置邮件消息的主题
//				mailMessage.setSubject(mailInfo.getSubject());
//				// 设置邮件消息发送的时间
//				mailMessage.setSentDate(new Date());
//				// 设置邮件消息的主要内容
//				String mailContent = mailInfo.getContent();
//				mailMessage.setText(mailContent);
//				// 解决 no object DCH for MIME type multipart/mixed;
//				MailcapCommandMap mc = (MailcapCommandMap) CommandMap.getDefaultCommandMap();
//				mc.addMailcap("text/html;; x-java-content-handler=com.sun.mail.handlers.text_html");
//				mc.addMailcap("text/xml;; x-java-content-handler=com.sun.mail.handlers.text_xml");
//				mc.addMailcap("text/plain;; x-java-content-handler=com.sun.mail.handlers.text_plain");
//				mc.addMailcap("multipart/*;; x-java-content-handler=com.sun.mail.handlers.multipart_mixed");
//				mc.addMailcap("message/rfc822;; x-java-content-handler=com.sun.mail.handlers.message_rfc822");
//				CommandMap.setDefaultCommandMap(mc);
//				// 发送邮件
//				Transport.send(mailMessage);
//				return true;
//			} catch (UnsupportedEncodingException e) {
//				e.printStackTrace();
//			}
//		} catch (MessagingException ex) {
//			ex.printStackTrace();
//		}
//		return false;
//	}
	
}