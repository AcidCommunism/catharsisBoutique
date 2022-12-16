import nodemailer from 'nodemailer';

export class Mailer {
    private static transporter: nodemailer.Transporter;

    constructor(
        mailServerHost: string = process.env.EMAIL_SERVER_HOST,
        mailServerPort: number = process.env.EMAIL_SERVER_PORT,
        mailServerApiKey: string = process.env.EMAIL_SERVER_API_KEY
    ) {
        Mailer.transporter = nodemailer.createTransport({
            host: mailServerHost,
            port: mailServerPort,
            auth: {
                user: 'apikey',
                pass: mailServerApiKey,
            },
        });
    }

    static async sendMail(
        to: string,
        subject: string,
        html: string = 'null',
        text: string = ''
    ) {
        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to,
            subject,
            html,
            text,
        };

        return Mailer.transporter.sendMail(mailOptions);
    }
}
