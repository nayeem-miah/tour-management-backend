import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";

export const router = Router();

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    }
];

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
});

// router.use("/user", UserRoutes);
// router.use("/tour", tourRoutes);
// router.use("/booking", bookingRoutes);
// router.use("/division", divisionRoutes);
// router.use("/payment", paymentRoutes);
