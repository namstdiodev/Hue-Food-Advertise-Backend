const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser"); // Add body-parser middleware

// Initialize Firebase Admin SDK with your service account key
const serviceAccount = require("./service_account.json"); // Replace with the actual path to your service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Other Firebase Admin SDK configuration options
});

const app = express();
app.use(bodyParser.json()); // Enable JSON body parsing middleware

// Define your routes and middleware here

const PORT = process.env.PORT || 3000;

const db = admin.firestore();

app.post("/api/users/create", async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Add the user data to Firestore
    const userData = {
      email: userRecord.email,
      displayName: userRecord.displayName,
      uid: userRecord.uid,
      role
      // Add other user data as needed
    };

    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set(userData);

    res.status(201).json(userRecord.toJSON());
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
