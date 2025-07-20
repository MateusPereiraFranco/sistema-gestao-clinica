const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({ region: process.env.AWS_REGION });

/**
 * Envia um email usando o Amazon SES.
 * @param {object} options - As opções do email.
 * @param {string} options.email - O email do destinatário.
 * @param {string} options.subject - O assunto do email.
 * @param {string} options.message - O corpo do email em texto plano.
 * @param {string} [options.html] - O corpo do email em HTML (opcional).
 */
const sendEmail = async (options) => {
    const params = {
        Source: `Sistema Clínica IOA <${process.env.EMAIL_FROM}>`,
        Destination: {
            ToAddresses: [options.email],
        },
        Message: {
            Subject: {
                Data: options.subject,
                Charset: 'UTF-8',
            },
            Body: {
                ...(options.html
                    ? { Html: { Data: options.html, Charset: 'UTF-8' } }
                    : { Text: { Data: options.message, Charset: 'UTF-8' } }
                )
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
        console.log(`Email enviado com sucesso para ${options.email} via SES.`);
    } catch (error) {
        console.error("Falha ao enviar email via SES:", error);
        throw new Error("Não foi possível enviar o email.");
    }
};

module.exports = sendEmail;
