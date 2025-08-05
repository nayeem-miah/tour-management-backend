import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { DivisionController } from "./division.controller";
import { createDivisionSchema } from "./division.validation";

const router = Router();

router.post("/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createDivisionSchema),
    DivisionController.createDivision

)


export const DivisionRoutes = router