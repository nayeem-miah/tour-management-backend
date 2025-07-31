import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";

export const router = Router();
interface IModule {
    path: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    route: any

}

const moduleRoutes: IModule[] = [
    {
        path: "/user",
        route: UserRoutes
    }, {
        path: "/auth",
        route: AuthRoutes
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
