import {type Request, type Response, Router as expressRouter} from "express";
import { logIn, signIn } from "../controllers/user-controller.js";

const router = expressRouter() as  expressRouter;

router.post("/sign-in",async (req: Request, res: Response) => {
  await signIn(req, res);
});

router.post("/log-in",async (req: Request, res: Response) => {
  await logIn(req, res);
});

export default router;