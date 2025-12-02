import "dotenv/config";
import express from "express";
import cors from "cors";
import aiRoutes from "./aiRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/ai", aiRoutes);

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
