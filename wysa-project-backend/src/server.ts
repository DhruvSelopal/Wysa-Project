import express from "express";
import http from "http";
import cors from "cors";

import { UserController } from "./controllers/user-controller";
import { QAController } from "./controllers/qa-controller";
import { validateToken } from "./middleware/auth-middleware";
import { connectDB } from "./confi/db";
import { QARepoistory } from "./repoistory/qa-repoistory";

(async () => {
  await connectDB();
  const app = express();
  app.use(express.json());
  app.use(cors());
  await QARepoistory.initialize();

  // HTTP server
  const server = http.createServer(app);


  // ================= USER ROUTES =================
  app.post("/user/register", UserController.register);
  app.post("/user/login", UserController.login);


  // ================= TEST ROUTES (PROTECTED) =================
  app.post("/test/start", validateToken, QAController.startTest);
  app.post("/test/question", validateToken, QAController.getQuestion);
  app.get("/test/getnextquestion",validateToken,QAController.getNextQuestion);
  app.post("/test/answer", validateToken, QAController.answerQuestion);
  app.get("/test/finish",validateToken,QAController.finishTest);


  // ================= SERVER =================
  const PORT = 3000;

  server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
  });
})();