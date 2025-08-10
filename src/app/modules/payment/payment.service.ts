/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import { ISslCommerce } from "../sslCommerce/sslCommerce.interface";
import { SSLService } from "../sslCommerce/sslCommerce.service";

const initPayment = async (bookingId: string) => {
    const payment = await Payment.findOne({ booking: bookingId });

    if (!payment) {
        throw new AppError(StatusCodes.NOT_FOUND, "Payment not found, You have not book tour")
    };

    const booking = await Booking.findById(payment.booking);

    // SSL
    const userAddress = (booking?.user as any).address
    const userEmail = (booking?.user as any).email
    const userPhoneNumber = (booking?.user as any).phone
    const userName = (booking?.user as any).name

    const sslPayload: ISslCommerce = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId
    }

    const sslPayment = await SSLService.sslPaymentInit(sslPayload)

    return {
        paymentUrl: sslPayment.GatewayPageURL,
    }



};

const successPayment = async (query: Record<string, string>) => {

    // update booking status to confirm
    // update payment status to PAID

    //  transaction rollback
    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PAYMENT_STATUS.PAID, },
            { runValidators: true, session })

        // booking status update
        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.COMPLETE },
            { runValidators: true, session }
        )

        await session.commitTransaction(); //transaction
        session.endSession()
        return {
            success: true,
            message: "Payment completed successfully"
        }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};

const failPayment = async (query: Record<string, string>) => {

    // update booking status to FAIL
    //  update payment status to FAIL
    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PAYMENT_STATUS.FAILED, },
            { runValidators: true, session })

        // booking status update
        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.FAILED },
            { runValidators: true, session }
        )

        await session.commitTransaction(); //transaction
        session.endSession()
        return {
            success: false,
            message: "Payment failed!"
        }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};

const cancelPayment = async (query: Record<string, string>) => {

    // update booking status to CANCEL
    // update payment status to CANCEL
    const session = await Booking.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PAYMENT_STATUS.CANALED },
            { runValidators: true, session })

        // booking status update
        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.CANCEL },
            { runValidators: true, session }
        )

        await session.commitTransaction(); //transaction
        session.endSession()
        return {
            success: false,
            message: "Payment canceled ❌"
        }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};


export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment
}