// import dotenv from "dotenv";

// import app from "./app.js";

// import connectDB
// from "./config/db.js";

// dotenv.config();

// connectDB();

// const PORT =
//   process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(
//     `Server running on ${PORT}`
//   );
// });


import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
