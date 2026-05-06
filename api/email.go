package api

import (
	"fmt"
	"log"
	"net/smtp"
)

func SendWelcomeEmail(toEmail, firstName string) {

	from := "tatevik502@gmail.com"
	password := "ocop gsbf hehn mxri"

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	subject := "Subject: Բարի գալուստ MyJobs! 🎉\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

	body := fmt.Sprintf(`
		<html>
			<body style="font-family: Arial, sans-serif; background-color: #fdfbf7; padding: 20px;">
				<div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 20px; border: 2px solid #8c634a;">
					<h2 style="color: #8c634a; text-align: center;">Բարի գալուստ MyJobs, %s!</h2>
					<p style="text-align: center; font-size: 16px;">Շնորհակալություն MyJobs հարթակում գրանցվելու համար:</p>
					<div style="text-align: center; margin-top: 20px;">
						<a href="http://localhost:5173" style="background: #8c634a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold;">Մտնել կայք</a>
					</div>
					<p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">Հարգանքներով՝ MyJobs Թիմ</p>
				</div>
			</body>
		</html>
	`, firstName)

	msg := []byte(subject + mime + body)
	auth := smtp.PlainAuth("", from, password, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, msg)
	if err != nil {
		log.Println("⚠️ Email Error (tatevik502@gmail.com):", err)
		return
	}
	log.Println("✅ Բարի գալուստի նամակը ուղարկվեց tatevik502@gmail.com-ից դեպի՝", toEmail)
}
