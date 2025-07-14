const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Criar um "transportador" (o serviço que vai enviar o email)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // true para a porta 465, false para outras
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Definir as opções do email
    const mailOptions = {
        from: `Sistema Clínica IOA <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: para emails mais complexos com HTML
    };

    // 3. Enviar o email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;