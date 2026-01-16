import { Router } from "express";
import { teamInviteController } from "@/controllers/team-invite-controller";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { reqResAsyncHandler } from "@/utils/http";

const router = Router();

router.get(
  "/invite/:token",
  reqResAsyncHandler(teamInviteController.getInviteByToken)
);

router.use(supabaseAuth);

router.post("/invite", reqResAsyncHandler(teamInviteController.createInvite));

router.get(
  "/invites/sent",
  reqResAsyncHandler(teamInviteController.getSentInvites)
);

router.get(
  "/invites/received",
  reqResAsyncHandler(teamInviteController.getReceivedInvites)
);

router.post(
  "/invite/respond",
  reqResAsyncHandler(teamInviteController.respondToInvite)
);

router.delete(
  "/invite/:id",
  reqResAsyncHandler(teamInviteController.cancelInvite)
);

router.post(
  "/invite/:id/resend",
  reqResAsyncHandler(teamInviteController.resendInvite)
);

router.post("/", reqResAsyncHandler(teamInviteController.createTeam));

router.get("/", reqResAsyncHandler(teamInviteController.getMyTeams));

router.get(
  "/:teamId/members",
  reqResAsyncHandler(teamInviteController.getTeamMembers)
);

export default router;
