
import { sendWelcomeEmail } from "./subscribe.service.js";

// ── POST /api/subscribe ────────────────────────────────────────
export async function subscribe(req, res) {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Email format check
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Already subscribed check
    // const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    // if (existing) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "This email is already subscribed!",
    //   });
    // }

    // // Save to DB
    // await Subscriber.create({ email: email.toLowerCase().trim() });

    // Send welcome email
    await sendWelcomeEmail(email);

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully! Check your inbox 📬",
    });

  } catch (error) {
    console.error("Subscribe error:", error);

    // Mongoose duplicate key error
    // if (error.code === 11000) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "This email is already subscribed!",
    //   });
    // }

    // Email sending failed but subscription saved
    // if (error.message?.includes("sendMail")) {
    //   return res.status(201).json({
    //     success: true,
    //     message: "Subscribed! Email delivery may take a few minutes.",
    //   });
    //}

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}

// ── GET /api/subscribe/all (Admin only) ───────────────────────
// export async function getAllSubscribers(req, res) {
//   try {
//     const subscribers = await Subscriber.find({ isActive: true })
//       .select("email createdAt")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: subscribers.length,
//       subscribers,
//     });
//   } catch (error) {
//     console.error("GetAllSubscribers error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// }

// // ── DELETE /api/subscribe/unsubscribe ─────────────────────────
// export async function unsubscribe(req, res) {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const subscriber = await Subscriber.findOneAndUpdate(
//       { email: email.toLowerCase() },
//       { isActive: false },
//       { new: true }
//     );

//     if (!subscriber) {
//       return res.status(404).json({
//         success: false,
//         message: "Email not found in our list",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Unsubscribed successfully. Sorry to see you go!",
//     });
//   } catch (error) {
//     console.error("Unsubscribe error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// }