"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const user_model_1 = require("../user/user.model");
const booking_interface_1 = require("./booking.interface");
const booking_model_1 = require("./booking.model");
const payment_model_1 = require("../payment/payment.model");
const payment_interface_1 = require("../payment/payment.interface");
const tour_model_1 = require("../tour/tour.model");
const sslCommerce_service_1 = require("../sslCommerce/sslCommerce.service");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const tour_constant_1 = require("../tour/tour.constant");
const getTransactionId_1 = require("../../utils/getTransactionId");
/**
 * -------------Transaction rollBack
 * duplicate db collection / replace
 * replica db--> [ create Booking --> create Payment ---> update Booking (payment id )]--> real db
 */
// ----------------------ssl------------------
// frontend --(localhost:5173)-> tour --> booking(pending)--> payment(unpaid) --- ssl Commerce page----> payment complete --> Backend(localhost:5000)---> update payment(paid) and booking(confirm) ---> redirect frontend(localhost:5173/payment/success)
// frontend --(localhost:5173)-> tour --> booking(pending)--> payment(unpaid) --- ssl Commerce page----> payment failed/cancel --> Backend(localhost:5000)---> update payment(fail/cancel) and booking(failed/cancel) ---> redirect frontend(localhost:5173/payment/fail)
const createBooking = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, getTransactionId_1.getTransactionId)();
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.phone) || !user.address) {
            throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Please Update Your Profile to Book a Tour.");
        }
        const tour = yield tour_model_1.Tour.findById(payload.tour).select("costFrom");
        if (!(tour === null || tour === void 0 ? void 0 : tour.costFrom)) {
            throw new appError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No Tour Cost Found!");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costFrom) * Number(payload.guestCount);
        const booking = yield booking_model_1.Booking.create([Object.assign({ user: userId, status: booking_interface_1.BOOKING_STATUS.PENDING }, payload)], { session });
        const payment = yield payment_model_1.Payment.create([{
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId: transactionId,
                amount: amount
            }], { session });
        const updatedBooking = yield booking_model_1.Booking
            .findByIdAndUpdate(booking[0]._id, { payment: payment[0]._id }, { new: true, runValidators: true, session })
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");
        // SSL
        const userAddress = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address;
        const userEmail = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email;
        const userPhoneNumber = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).phone;
        const userName = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name;
        const sslPayload = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        };
        const sslPayment = yield sslCommerce_service_1.SSLService.sslPaymentInit(sslPayload);
        // console.log(sslPayment);
        yield session.commitTransaction(); //transaction
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking
        };
    }
    catch (error) {
        yield session.abortTransaction(); // rollback
        session.endSession();
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error;
    }
});
const getAllBookings = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(booking_model_1.Booking.find(), query);
    const bookings = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        bookings.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data: data,
        meta: meta
    };
});
const getUsersBooking = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.Booking.find({ user: userId })
        .populate("tour user");
    return {
        data: booking
    };
});
const getBookingsById = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.Booking.findById(bookingId);
    return {
        data: booking
    };
});
const updateBooking = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
// const deleteBooking = async () => {
// };
exports.BookingServices = {
    createBooking,
    getAllBookings,
    updateBooking,
    // deleteBooking,
    getUsersBooking,
    getBookingsById
};
