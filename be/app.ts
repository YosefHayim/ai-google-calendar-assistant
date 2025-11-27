import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { CONFIG, SUPABASE } from "@/config/root-config";
import errorHandler from "@/middlewares/errorHandler";
import calendarRoute from "@/routes/calendarRoutes";
import usersRoute from "@/routes/users";
import whatsAppRoute from "@/routes/whatsappRoutes";
import { startTelegramBot } from "./telegram-bot/init-bot";
import { ROUTES, STATUS_RESPONSE } from "./types";
import { RoutineLearningService } from "./services/RoutineLearningService";
import { RoutineAnalysisJob } from "./services/RoutineAnalysisJob";

const app = express();
const PORT = CONFIG.port;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.status(STATUS_RESPONSE.SUCCESS).send("Server is running.");
});

app.use(ROUTES.USERS, usersRoute);
app.use(ROUTES.CALENDAR, calendarRoute);
app.use(ROUTES.WHATSAPP, whatsAppRoute);

app.use(errorHandler);

app.listen(PORT, (error?: Error) => {
  if (error) {
    throw error;
  }
  console.log(`Server is running on port: ${PORT}`);
});

startTelegramBot();

// Initialize and start routine analysis background job
try {
  const routineService = new RoutineLearningService(SUPABASE);
  const routineAnalysisJob = new RoutineAnalysisJob(SUPABASE, routineService, {
    schedule: "0 2 * * *", // Daily at 2 AM
    lookbackDays: 30,
    maxUsersPerRun: 100,
    enabled: true,
  });

  routineAnalysisJob.start();
  console.log("Routine analysis background job started");
} catch (error) {
  console.error("Failed to start routine analysis job:", error);
  // Don't crash the app if job fails to start
}
