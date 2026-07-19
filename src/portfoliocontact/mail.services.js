import transporter from "../config/mail.config.js";

export const sendContactMail = async (data) => {

    const { name, email, subject, message } = data;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Your portfolio email
        replyTo: email,
        subject: `Portfolio Contact: ${subject}`,
        html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5">
            <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:10px">
                <h2 style="color:#007bff;">New Contact Request</h2>

                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td><strong>Name</strong></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><strong>Email</strong></td>
                        <td>${email}</td>
                    </tr>
                    <tr>
                        <td><strong>Subject</strong></td>
                        <td>${subject}</td>
                    </tr>
                </table>

                <hr>

                <h3>Message</h3>

                <p>${message}</p>

                <br>
            </div>
        </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};
