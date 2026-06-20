const admin = require("firebase-admin");

let app = null;

function initFirebase() {
  if (app) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env variable missing");

  const serviceAccount = JSON.parse(raw);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase initialized successfully");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    initFirebase();

    const { topic, title, body } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({ success: false, message: "topic, title and body are required" });
    }

    const message = {
      topic: topic,
      notification: { title: title, body: body },
      data: {
        type: "emergency",
        stickId: topic.replace("emergency_", ""),
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, messageId: response });

  } catch (error) {
    console.error("ERROR:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};