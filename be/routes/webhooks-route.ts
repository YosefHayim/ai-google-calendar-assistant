import { contactController } from "@/controllers/contact-controller";
import express from "express";

const router = express.Router();

router.post("/resend/inbound", contactController.handleInboundEmail);

export default router;
