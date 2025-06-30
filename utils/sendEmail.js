const nodeMailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {

    const transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `BookStore App <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
    };
    await transporter.sendMail(mailOptions);
}


module.exports = sendEmail;