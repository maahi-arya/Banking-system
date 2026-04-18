require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({         //
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegisterationEmail(userEmail, name){
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`
    const html = `<p style="color: #555; font-size: 16px; line-height: 1.5">Hello ${name}, </p><p style="color: red; font-size: 16px;">Thank you for registering at Backend Ledger. we're excited to have you on board!</p><img src="https://via.placeholder.com/300"
                   width="300"
                   style="margin: 20px 0; border-radius: 8px;" /><p>Best regards,<br>The Backend Ledger Team</p>
                   <a href="https://yourwebsite.com"
                 style="display: inline-block;
                        background-color: #4CAF50;
                        color: #ffffff;
                        padding: 12px 25px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                        margin-top: 10px;">
                Get Started 🚀
              </a>`;

    await sendEmail(userEmail, subject,text,html)

}
async function sendTransactionEmail(userEmail, name, amount, toAccount){
  const subject = "transaction Alert: You've sent money!";
  const text = `Hello ${name},\n\nYou have sent ${amount} to account ${toAccount} successfully.\n\nBest regards,\nThe Backend Ledger Team.`
  const html = `<p style="color: #555; font-size: 16px; line-height: 1.5">Hello ${name},</p><p style="color: #555; font-size: 16px;">You have sent ${amount} to account ${toAccount} successfully.\n\nBest regards,\nThe Backend Ledger Team.</p>`

  await sendEmail(userEmail, subject, text,html)
}
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount){
  const subject = "transaction Alert: Transaction failed!";
  const text = `Hello ${name},\n\n Your transaction of ${amount} to account ${toAccount} has failed. Please try again later or contact support if the issue persists.\n\nBest regards,\nThe Backend Ledger Team.`
  const html = `<p style="color: #555; font-size: 16px; line-height:1.5">Hello ${name},</p><p style="color: red; fomt-size: 16px;">You transaction of ${amount} to account ${toAccount} has Failed. Please try again later or contact support if the issue persists.</p><p>Best regards,<br>The Backend Ledger team.</p>`
  

}

module.exports = { sendRegisterationEmail,
                   sendTransactionEmail,
                   sendTransactionFailureEmail,
 };