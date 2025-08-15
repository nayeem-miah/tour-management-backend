import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";
import { TourRoutes } from "../modules/tour/tour.route";
import { BookingRouter } from "../modules/booking/booking.route";
import { PaymentRouter } from "../modules/payment/payment.route";
import { OtpRouter } from "../modules/otp/otp.route";
import { StatsRoutes } from "../modules/stats/stats.route";

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
    },
    {
        path: "/tour",
        route: TourRoutes
    },
    {
        path: "/booking",
        route: BookingRouter
    },
    {
        path: "/payment",
        route: PaymentRouter
    },
    {
        path: "/otp",
        route: OtpRouter
    },
    {
        path: "/stats",
        route: StatsRoutes
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
