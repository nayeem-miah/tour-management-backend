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

/** 
 * duplicate db collection / replace
 * replica db--> [ create Booking --> create Payment ---> update Booking (payment id )]--> real db
 * 
 * 
 */


const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId()

    const session = await Booking.startSession();
    session.startTransaction()

    try {
        const user = await User.findById(userId);
        console.log(user);
        if (!user?.phone || !user.address) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Please Update Your Profile to Book a Tour.")
        }

        const tour = await Tour.findById(payload.tour).select("costFrom")
        console.log(tour);
        if (!tour?.costFrom) {
            throw new AppError(StatusCodes.BAD_REQUEST, "No Tour Cost Found!")
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costFrom) * Number(payload.guestCount!)

        const booking = await Booking.create([{
            user: userId,
            status: BOOKING_STATUS.PENDING,
            ...payload
        }], { session })

        const payment = await Payment.create([{
            booking: booking[0]._id,
            status: PAYMENT_STATUS.UNPAID,
            transactionId: transactionId,
            amount: amount
        }], { session })

        const updatedBooking = await Booking
            .findByIdAndUpdate(
                booking[0]._id,
                { payment: payment[0]._id },
                { new: true, runValidators: true, session }
            )
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");



        await session.commitTransaction(); //transaction
        session.endSession()
        return {
            booking: updatedBooking
        }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};
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