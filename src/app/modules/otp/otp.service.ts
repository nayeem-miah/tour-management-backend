import crypto from "crypto"
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";

const OTP_EXPIRATION = 2 * 60 // 2 minuit

const generateOtp = (length = 6) => {
    //  6 degit otp
    //  10 * 10 * 10 * 10 * 10 ----> 1000000
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()  // ** ---> 10** 2 ==> 100

    return otp
}


const sendOTP = async (email: string, name: string) => {

    const otp = generateOtp();

    const redisKey = `otp:${email}`;

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    })

    await sendEmail({
        to: email,
        subject: "Your otp code",
        templateName: "otp",
        templateData: {
            name: name,
            otp: otp
        }
    })
}

const verifyOTP = () => {

    return {}
}

export const OtpServices = {
    sendOTP,
    verifyOTP
}