import {type Request, type Response, Router as expressRouter} from "express";
import { forgetPasswordRequest, logIn, resetPassword, signIn } from "../controllers/user-controller.js";

const router = expressRouter() as  expressRouter;

router.post("/sign-in",async (req: Request, res: Response) => {
  await signIn(req, res);
});

router.post("/log-in",async (req: Request, res: Response) => {
  await logIn(req, res);
});

router.post("/forget-password",async (req: Request, res: Response) => {
  await forgetPasswordRequest(req, res);
});

router.post("/reset-password/:token",async (req: Request, res: Response) => {
  await resetPassword(req, res);
});

export default router;