const admin = require("firebase-admin");

// Read Firebase Service Account from Vercel Environment Variable
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = async (req, res) => {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }

  try {
    const { topic, title, body } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "topic, title and body are required",
      });
    }

    const message = {
      topic: topic,
      notification: {
        title: title,
        body: body,
      },
    };

    const response = await admin.messaging().send(message);

    return res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("FCM ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};