import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendReminderEmail(
  userEmail: string,
  userName: string,
  website: {
    title: string
    url: string
    type: string
    scheduledFor: Date
  },
) {
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧠 MindWell Reminder</h1>
                <p>Your scheduled content is ready for review!</p>
            </div>
            <div class="content">
                <h2>Hi ${userName}!</h2>
                <p>You scheduled a reminder for this ${website.type}:</p>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea;">
                    <h3 style="margin: 0 0 10px 0;">${website.title}</h3>
                    <p style="color: #666; margin: 0;">Scheduled for: ${website.scheduledFor.toLocaleDateString()}</p>
                </div>
                
                <p>Click the button below to view your content:</p>
                <a href="${website.url}" class="button">View Content</a>
                
                <p>Or visit your MindWell dashboard to manage all your saved content.</p>
                <a href="${process.env.NEXTAUTH_URL}" class="button" style="background: #764ba2;">Open MindWell</a>
            </div>
            <div class="footer">
                <p>This reminder was sent from your MindWell app. You can manage your reminders in your dashboard.</p>
            </div>
        </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: `"MindWell" <${process.env.GMAIL_USER}>`,
    to: userEmail,
    subject: `🧠 Reminder: ${website.title}`,
    html: emailTemplate,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Reminder email sent to ${userEmail} for ${website.title}`)
    return true
  } catch (error) {
    console.error("Error sending reminder email:", error)
    return false
  }
}
