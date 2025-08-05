import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";

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
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/division",
        route: DivisionRoutes
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
