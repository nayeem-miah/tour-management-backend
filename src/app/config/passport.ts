import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs"

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExists = await User.findOne({ email });

            // user not found
            // if (!isUserExists) {
            //     return done(null, false, { message: "user not found" })
            // }

            if (!isUserExists) {
                return done("User does not exists")
            }


            //  user auths
            const isGoogleAuthenticated = isUserExists?.auths.some(providerObj => providerObj.provider === "google");

            if (isGoogleAuthenticated && !isUserExists.password) {
                return done(null, false, { message: "You have authenticated thought google. Want to login to credential, then at first login with google and set a password your gmail and you can login with email and password" })
            }

            // if (isGoogleAuthenticated) {
            //     return done("You have authenticated thought google. Want to login to credential, then at first login with google and set a password your gmail and you can login with email and password")
            // }

            // check password
            const isPasswordMatch = await bcrypt.compare(password as string, isUserExists.password as string);

            console.log(isPasswordMatch, "password is match");
            // incorrect password
            if (!isPasswordMatch) {
                return done(null, false, { message: "Invalid email or password" })
            }

            // success 
            return done(null, isUserExists)
        } catch (error) {
            console.log(error);
            return done(error)
        }
    })
)













passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL

        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(null, false, { message: "no email found" })
                }
                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVerified: true,
                        auths: [
                            {
                                provider: "google",
                                providerId: profile.id
                            }
                        ]
                    })
                }
                return done(null, user)

            } catch (error) {
                console.log("google staggy error", error);
                return done(error)
            }
        }
    )
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error)
    }
});


