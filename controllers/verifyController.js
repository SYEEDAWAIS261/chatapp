// const twilio = require("twilio");

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// // Send verification code
// exports.sendVerification = async (req, res) => {
//   const { phone } = req.body;
//   try {
//     const verification = await client.verify
//       .v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verifications.create({
//         to: phone,
//         channel: "sms",
//       });

//     res.status(200).json({ success: true, status: verification.status });
//   } catch (error) {
//     console.error("Send Verification Error:", error);
//     res.status(500).json({ error: "Failed to send verification code" });
//   }
// };

// // Verify code
// exports.verifyCode = async (req, res) => {
//   const { phone, code } = req.body;
// console.log("Using Verify SID:", process.env.TWILIO_VERIFY_SERVICE_SID); // 👈
//   try {
//     const check = await client.verify
//       .v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verificationChecks.create({
//         to: phone,
//         code,
//       });

//     if (check.status === "approved") {
//       res.status(200).json({ success: true });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid code" });
//     }
//   } catch (error) {
//     console.error("Verification Check Error:", error);
//     res.status(500).json({ error: "Code verification failed" });
//   }
// };
