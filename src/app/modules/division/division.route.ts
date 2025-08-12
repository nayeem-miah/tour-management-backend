import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { DivisionController } from "./division.controller";
import { createDivisionSchema, updateDivisionSchema } from "./division.validation";

import { multerUpload } from "../../config/multer.config";

const router = Router();

/**
 * 'file' : IMAGE ,
 * data : body text data => req.body => req.body.data
 */

//  from data --> body , file
router.post("/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(createDivisionSchema),
    DivisionController.createDivision
);

router.get("/", DivisionController.getAllDivision);
router.get("/:slug", DivisionController.getSingleDivision)

router.patch("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(updateDivisionSchema),
    DivisionController.updateDivision
);

router.delete("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DivisionController.deleteDivision
);



export const DivisionRoutes = router;