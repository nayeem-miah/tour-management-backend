import { Router } from "express";
import { TourController } from "./tour.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTourZodSchema, updateTourZodSchema } from "./tour.validation";

const router = Router();





// --------------Tour Route-----------------

router.get("/", TourController.getAllTours);

router.post("/create",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(createTourZodSchema),
    TourController.createTour
);

//  patch route 
router.patch("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateTourZodSchema),
    TourController.updateTour
);

router.delete("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    TourController.deleteTour
)





export const TourRoutes = router;