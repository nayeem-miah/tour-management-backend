/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post("/change-password", checkAuth(...Object.values(Role)), AuthControllers.changePassword);
router.post("/set-password", checkAuth(...Object.values(Role)), AuthControllers.setPassword);
router.post("/forgot-password", AuthControllers.forgotPassword);
router.post("/reset-password", checkAuth(...Object.values(Role)), AuthControllers.resetPassword);

// forget password --> frontend --> forget password ---> email--> user status check ---> short expire token(10 min)--> email --> frontend link(http//:localhost5173/reset-password?email=email@gmail.com&token=token) --> frontend a user er email token extract kure anbo --> new password user theki ---> backend er reset-password er /reset-password api --> authorization = token --> new password --> token verify ---> hash password --> save user password


// booking ---> /login ----> success login --> /booking frontend
// /login ----> successfully google login ---> frontend
router.get("/google", async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";

    passport.authenticate("google", { scope: ["profile", "email"], state: redirect as string })(req, res)
})

// /api/v1/auth/callback?state=/booking 
router.get("/google/callback", passport.authenticate("google", { failureRedirect: `${envVars.FRONTEND_URL}/login?error=there is some issue with your account. Please contact our support team.` }), AuthControllers.googleCallbackController)

export const AuthRoutes = router;