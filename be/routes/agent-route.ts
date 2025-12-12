import { agentController } from "@/controllers/agent-controller";
import { authHandler } from "@/middlewares/auth-handler";
import express from "express";

const router = express.Router();

router.post("/query", authHandler, agentController.queryAgent);

export default router;
