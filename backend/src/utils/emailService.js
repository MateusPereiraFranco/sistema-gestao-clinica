//const { Resend } = require('resend');

// instalar o resend no projeto principal *** colocar no .env a chave da api do resend *************************************************

/*
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia um email usando o Resend.
 * @param {object} options - As opções do email.
 * @param {string} options.email - O email do destinatário.
 * @param {string} options.subject - O assunto do email.
 * @param {string} options.message - O corpo do email em texto plano.
 * @param {string} [options.html] - O corpo do email em HTML (opcional).
 */
/*
const sendEmail = async (options) => {
    try {
        console.log(`Enviando email para ${options.email}...`);
        await resend.emails.send({
            from: `Sistema Clínicas - Mesopnet <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            html: options.html || `<p>${options.message}</p>`,
        });
        console.log(`Email enviado com sucesso para ${options.email} via Resend.`);
    } catch (error) {
        console.error("Falha ao enviar email via Resend:", error);
        throw new Error("Não foi possível enviar o email.");
    }
};

module.exports = sendEmail;
*/