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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const tour_model_1 = require("../tour/tour.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsersPromise = user_model_1.User.countDocuments();
    const totalActiveUserPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.ACTIVE });
    const totalInActiveUsersPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.INACTIVE });
    const totalBlockedUsersPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.BLOCKED });
    const newUsersInLast7daysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });
    const newUsersInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });
    const userByRolePromise = user_model_1.User.aggregate([
        // stage 1 : Grouping user by role and count total users in each role
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ]);
    const [totalUsers, totalActiveUser, totalInactiveUsers, totalBlockedUser, newUsersInLast7days, newUsersInLast30Days, userByRole] = yield Promise.all([
        totalUsersPromise,
        totalActiveUserPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7daysPromise,
        newUsersInLast30DaysPromise,
        userByRolePromise
    ]);
    return {
        totalUsers,
        totalActiveUser,
        totalInactiveUsers,
        totalBlockedUser,
        newUsersInLast7days,
        newUsersInLast30Days,
        userByRole
    };
});
const getTourStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalTourPromise = tour_model_1.Tour.countDocuments();
    // await Tour.updateMany(
    //     {
    //         // Only update where tourType or division is stored as a string
    //         $or: [
    //             { tourType: { $type: "string" } },
    //             { division: { $type: "string" } }
    //         ]
    //     },
    //     [
    //         {
    //             $set: {
    //                 tourType: { $toObjectId: "$tourType" },
    //                 division: { $toObjectId: "$division" }
    //             }
    //         }
    //     ]
    // );
    const totalTourByTourTypePromise = tour_model_1.Tour.aggregate([
        // stage 1 : connect Tour Types model--> lookup stage
        {
            $lookup: {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "type"
            }
        },
        // stage 2 : unwind the array to object
        {
            $unwind: "$type"
        },
        // stage 3 : grouping tour types
        {
            $group: {
                _id: "$type.name",
                count: { $sum: 1 }
            }
        }
    ]);
    const averageTourCostPromise = tour_model_1.Tour.aggregate([
        //  stage 1 : group the cost from , do sum and average the sum
        {
            $group: {
                _id: null,
                averageCostFrom: { $avg: "$costFrom" }
            }
        }
    ]);
    const totalTourByDivisionPromise = tour_model_1.Tour.aggregate([
        // stage 1 : connect division model ---> $lookup stage
        {
            $lookup: {
                from: "divisions",
                localField: "division",
                foreignField: "_id",
                as: "division"
            }
        },
        //stage 2 --> unwind the array to object
        {
            $unwind: "$division"
        },
        // stage 3 --> grouping division
        {
            $group: {
                _id: "$division.name",
                count: { $sum: 1 }
            }
        }
    ]);
    const totalHighestBookedTourPromise = booking_model_1.Booking.aggregate([
        // stage-1 : Group the tour
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },
        //stage-2 : sort the tour
        {
            $sort: { bookingCount: -1 }
        },
        //stage-3 : sort
        {
            $limit: 5
        },
        //stage-4 lookup stage
        {
            $lookup: {
                from: "tours",
                let: { tourId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$tourId"] }
                        }
                    }
                ],
                as: "tour"
            }
        },
        //stage-5 unwind stage
        { $unwind: "$tour" },
        //stage-6 Project stage
        {
            $project: {
                bookingCount: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ]);
    const [totalTour, totalTourByTourType, averageTourCost, totalTourByDivision, totalHighestBookedTour] = yield Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        averageTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise
    ]);
    return {
        totalTour,
        totalTourByTourType,
        averageTourCost,
        totalTourByDivision,
        totalHighestBookedTour
    };
});
const getBookingStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalBookingPromise = booking_model_1.Booking.countDocuments();
    const totalBookingByStatusPromise = booking_model_1.Booking.aggregate([
        // stage 1 : group stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
    const bookingsPerTourPromise = booking_model_1.Booking.aggregate([
        //  stage : 1 ---> grouping
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },
        // stage 2 --> 
        {
            $sort: { bookingCount: -1 }
        },
        //  stage 3 -- limit stage
        {
            $limit: 10
        },
        // stage :4 --- lookup 
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour"
            }
        },
        //  stage 5 -- unwind stage
        { $unwind: "$tour" },
        //  stage 6 ---> project stage
        {
            $project: {
                bookingCount: 1,
                _id: 1,
                "tour.title": 1,
                "tour.slug": 1,
            }
        }
    ]);
    const averageGuestCountPerBookingPromise = booking_model_1.Booking.aggregate([
        // stage 1 --> group stage
        {
            $group: {
                _id: null,
                averageGuestCount: { $avg: "$guestCount" }
            }
        }
    ]);
    const bookingLast7DaysPromise = booking_model_1.Booking.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const booking30DaysAgoPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });
    const totalBookingsByUniqueUserPromise = booking_model_1.Booking.distinct("user").then((user) => user.length);
    const [totalBooking, totalBookingByStatus, bookingsPerTour, averageGuestCountPerBooking, bookingLast7Days, booking30DaysAgo, totalBookingsByUniqueUser,] = yield Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingsPerTourPromise,
        averageGuestCountPerBookingPromise,
        bookingLast7DaysPromise,
        booking30DaysAgoPromise,
        totalBookingsByUniqueUserPromise,
    ]);
    return {
        totalBooking,
        totalBookingByStatus,
        bookingsPerTour,
        averageGuestCountPerBooking: Math.ceil(averageGuestCountPerBooking[0].averageGuestCount),
        bookingLast7Days,
        booking30DaysAgo,
        totalBookingsByUniqueUser
    };
});
const getPaymentStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalPaymentPromise = payment_model_1.Payment.countDocuments();
    const totalPaymentByStatusPromise = payment_model_1.Payment.aggregate([
        // stage 1 group stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
    const totalRevenuePromise = payment_model_1.Payment.aggregate([
        //  stage 1 match stage
        {
            $match: { status: payment_interface_1.PAYMENT_STATUS.PAID }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" }
            }
        }
    ]);
    const avgTotalAmountPromise = payment_model_1.Payment.aggregate([
        //  stage 1 --> group stage
        {
            $group: {
                _id: null,
                averagePaymentAmount: { $avg: "$amount" }
            }
        }
    ]);
    const paymentGatewayDataPromise = payment_model_1.Payment.aggregate([
        // state 1: group stage
        {
            $group: {
                _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
                count: { $sum: 1 }
            }
        }
    ]);
    const [totalPayment, totalPaymentByStatus, totalRevenue, avgTotalAmount, paymentGatewayData,] = yield Promise.all([
        totalPaymentPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgTotalAmountPromise,
        paymentGatewayDataPromise
    ]);
    return {
        totalPayment,
        totalPaymentByStatus,
        totalRevenue,
        avgTotalAmount,
        paymentGatewayData
    };
});
exports.StatsService = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getTourStats
};
