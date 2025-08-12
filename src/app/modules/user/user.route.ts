import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema, updatedUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";


const router = Router();


router.post("/register",
    validateRequest(createUserZodSchema),
    UserControllers.createUser);

router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers
);

// user  profile
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)

router.get("/:id", UserControllers.getSingleUser)

router.patch("/:id", validateRequest(updatedUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)

export const UserRoutes = router;
