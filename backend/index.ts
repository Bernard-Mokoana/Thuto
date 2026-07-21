import app from "./src/app.ts";
import connectDB from "./src/config/db.ts";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const port: number = parseInt(process.env.PORT || "8001", 10);

try {
  connectDB();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} catch (error) {
  console.log("Server failed to run");
}
