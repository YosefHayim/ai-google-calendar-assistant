import express from "express";
import { contactController } from "@/controllers/contact-controller";

const router = express.Router();

router.post("/resend/inbound", contactController.handleInboundEmail);

export default router;
