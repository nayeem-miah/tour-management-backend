import { Router } from "express";
import { TourController } from "./tour.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTourZodSchema } from "./tour.validation";

const router = Router();





// --------------Tour -----------------

router.get("/", TourController.getAllTour);

router.post("/create",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(createTourZodSchema),
    TourController.createTour
)



export const TourRoutes = router;