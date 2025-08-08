import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { User } from "../user/user.model"
import { BOOKING_STATUS, IBooking } from "./booking.interface"
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";

const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

const createBooking = async (payload: Partial<IBooking>, userId: string) => {

    const transactionId = getTransactionId()

    const user = await User.findById(userId);

    if (!user?.phone || !user.address) {
        throw new AppError(StatusCodes.BAD_REQUEST, "please update your profile to book a tour !")
    }

    const tour = await Tour.findById(payload.tour).select("costFrom");

    if (!tour?.costFrom) {
        throw new AppError(StatusCodes.BAD_GATEWAY, "No tour cost found!")
    }


    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const amount = Number(tour.costFrom) * Number(payload.guestCount!)

    const booking = await Booking.create({
        ...payload,
        user: userId,
        status: BOOKING_STATUS.PENDING

    })

    const payment = await Payment.create({
        booking: booking._id,
        status: PAYMENT_STATUS.UNPAID,
        transactionId: transactionId,
        amount: amount
    });
    //  update booking status 
    const updateBooking = await Booking
        .findByIdAndUpdate(
            booking._id,
            { payment: payment._id },
            { new: true, runValidators: true }
        )
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment")

    return updateBooking
}
const getAllBookings = async () => {

    return {}
}
const getUsersBooking = async () => {

    return {}
}
const getBookingsById = async () => {

    return {}
}
const updateBooking = async () => {

    return {}
}
// const deleteBooking = async () => {

// };


export const BookingServices = {
    createBooking,
    getAllBookings,
    updateBooking,
    // deleteBooking,
    getUsersBooking,
    getBookingsById
}