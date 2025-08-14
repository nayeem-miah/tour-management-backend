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

const getTourStats = () => {
    return {}
}

const getBookingStats = () => {
    return {}
}
const getPaymentStats = () => {
    return {}
}




export const StatsService = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getTourStats
}