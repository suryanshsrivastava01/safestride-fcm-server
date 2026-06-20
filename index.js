const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SafeStride FCM Server Connected To Firebase 🚀");
});

app.get("/test-notification", (req, res) => {
  res.send("Notification API Ready 🚀");
});

app.post("/send-notification", async (req, res) => {
  try {
    console.log("POST HIT");
    console.log(req.body);

    const { topic, title, body } = req.body;

    const message = {
      topic: topic,
      notification: {
        title: title,
        body: body,
      },
    };

    const response = await getMessaging().send(message);

    console.log("FCM SENT:", response);

    res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("FCM Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});