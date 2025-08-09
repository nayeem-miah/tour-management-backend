import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { BookingController } from "./booking.controller";
import { createBookingZodSchema, updateBookingStatusZodSchema } from "./booking.validation";

const router = express.Router();

// api/v1/booking
router.post("/",
    checkAuth(...Object.values(Role)),
    validateRequest(createBookingZodSchema),
    BookingController.createBooking
)

// api/v1/booking
router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    BookingController.getAllBookings
);

// api/v1/booking/my-booking
router.get("/my-bookings",
    checkAuth(...Object.values(Role)),
    BookingController.getUsersBooking
);

// api/v1/booking/:bookingId
router.get("/:bookingId",
    checkAuth(...Object.values(Role)),
    BookingController.getSingleBooking
);

// api/v1/booking/:bookingId/status
router.patch("/:bookingId/status",
    checkAuth(...Object.values(Role)),
    validateRequest(updateBookingStatusZodSchema),
    BookingController.updateBooking
)



export const BookingRouter = router;