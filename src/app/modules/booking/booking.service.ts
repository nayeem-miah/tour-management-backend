/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { User } from "../user/user.model"
import { BOOKING_STATUS, IBooking } from "./booking.interface"
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";
import { SSLService } from "../sslCommerce/sslCommerce.service";
import { ISslCommerce } from "../sslCommerce/sslCommerce.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { tourSearchableFields } from "../tour/tour.constant";

const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

/** 
 * -------------Transaction rollBack
 * duplicate db collection / replace
 * replica db--> [ create Booking --> create Payment ---> update Booking (payment id )]--> real db
 */



// ----------------------ssl------------------
// frontend --(localhost:5173)-> tour --> booking(pending)--> payment(unpaid) --- ssl Commerce page----> payment complete --> Backend(localhost:5000)---> update payment(paid) and booking(confirm) ---> redirect frontend(localhost:5173/payment/success)

// frontend --(localhost:5173)-> tour --> booking(pending)--> payment(unpaid) --- ssl Commerce page----> payment failed/cancel --> Backend(localhost:5000)---> update payment(fail/cancel) and booking(failed/cancel) ---> redirect frontend(localhost:5173/payment/fail)

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId()

    const session = await Booking.startSession();
    session.startTransaction()

    try {
        const user = await User.findById(userId);

        if (!user?.phone || !user.address) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Please Update Your Profile to Book a Tour.")
        }

        const tour = await Tour.findById(payload.tour).select("costFrom")

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

        // SSL
        const userAddress = (updatedBooking?.user as any).address
        const userEmail = (updatedBooking?.user as any).email
        const userPhoneNumber = (updatedBooking?.user as any).phone
        const userName = (updatedBooking?.user as any).name

        const sslPayload: ISslCommerce = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        }

        const sslPayment = await SSLService.sslPaymentInit(sslPayload)

        // console.log(sslPayment);

        await session.commitTransaction(); //transaction
        session.endSession()
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking

        }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};

const getAllBookings = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Booking.find(), query);

    const bookings = await queryBuilder
        .search([...tourSearchableFields, "user"])
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        bookings.build(),
        queryBuilder.getMeta()
    ])
    return {
        data: data,
        meta: meta
    }
}
const getUsersBooking = async (userId: string) => {
    const booking = await Booking.find({ user: userId })
    return {
        data: booking
    }
}
const getBookingsById = async (bookingId: string) => {
    const booking = await Booking.findById(bookingId);
    return {
        data: booking
    }
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