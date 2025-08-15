/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking } from "../booking/booking.model";
import { Tour } from "../tour/tour.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";

const now = new Date();

const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);


const getUserStats = async () => {
    const totalUsersPromise = User.countDocuments();

    const totalActiveUserPromise = User.countDocuments({ isActive: IsActive.ACTIVE });
    const totalInActiveUsersPromise = User.countDocuments({ isActive: IsActive.INACTIVE })
    const totalBlockedUsersPromise = User.countDocuments({ isActive: IsActive.BLOCKED })

    const newUsersInLast7daysPromise = User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });


    const newUsersInLast30DaysPromise = User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    })

    const userByRolePromise = User.aggregate([
        // stage 1 : Grouping user by role and count total users in each role

        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ])


    const [totalUsers, totalActiveUser, totalInactiveUsers, totalBlockedUser, newUsersInLast7days, newUsersInLast30Days, userByRole] = await Promise.all([
        totalUsersPromise,
        totalActiveUserPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7daysPromise,
        newUsersInLast30DaysPromise,
        userByRolePromise
    ])

    return {
        totalUsers,
        totalActiveUser,
        totalInactiveUsers,
        totalBlockedUser,
        newUsersInLast7days,
        newUsersInLast30Days,
        userByRole
    }
}

const getTourStats = async () => {
    const totalTourPromise = Tour.countDocuments();

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
    const totalTourByTourTypePromise = Tour.aggregate([
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
    ])

    const averageTourCostPromise = Tour.aggregate([
        //  stage 1 : group the cost from , do sum and average the sum
        {
            $group: {
                _id: null,
                averageCostFrom: { $avg: "$costFrom" }
            }
        }
    ])

    const totalTourByDivisionPromise = Tour.aggregate([
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
    ])

    const totalHighestBookedTourPromise = Booking.aggregate([
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
    ])
    const [totalTour, totalTourByTourType, averageTourCost, totalTourByDivision, totalHighestBookedTour] = await Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        averageTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise
    ])


    return {
        totalTour,
        totalTourByTourType,
        averageTourCost,
        totalTourByDivision,
        totalHighestBookedTour
    }
}

const getBookingStats = async () => {
    const totalBookingPromise = Booking.countDocuments();

    const totalBookingByStatusPromise = Booking.aggregate([
        // stage 1 : group stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const bookingsPerTourPromise = Booking.aggregate([
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
    ])

    const averageGuestCountPerBookingPromise = Booking.aggregate([
        // stage 1 --> group stage
        {
            $group: {
                _id: null,
                averageGuestCount: { $avg: "$guestCount" }
            }
        }
    ]);

    const bookingLast7DaysPromise = Booking.countDocuments({ createdAt: { $gte: sevenDaysAgo } })

    const booking30DaysAgoPromise = Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });

    const totalBookingsByUniqueUserPromise = Booking.distinct("user").then((user: any) => user.length)

    const [totalBooking,
        totalBookingByStatus,
        bookingsPerTour,
        averageGuestCountPerBooking,
        bookingLast7Days,
        booking30DaysAgo,
        totalBookingsByUniqueUser,

    ] = await Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingsPerTourPromise,
        averageGuestCountPerBookingPromise,
        bookingLast7DaysPromise,
        booking30DaysAgoPromise,
        totalBookingsByUniqueUserPromise,

    ])
    return {
        totalBooking,
        totalBookingByStatus,
        bookingsPerTour,
        averageGuestCountPerBooking: Math.ceil(averageGuestCountPerBooking[0].averageGuestCount),
        bookingLast7Days,
        booking30DaysAgo,
        totalBookingsByUniqueUser
    }
}
const getPaymentStats = () => {
    return {

    }
}




export const StatsService = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getTourStats
}