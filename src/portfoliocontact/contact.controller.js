import { sendContactMail } from "./mail.services.js";
export const contact = async (req, res) => {

    try {

        await sendContactMail(req.body);

        res.status(200).json({
            success: true,
            message: "Message sent successfully.",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to send message.",
        });
    }

};

