import { Strategy as JwtStrategy } from "passport-jwt";
import passport from "passport";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

/**JwtStrategy Options */
const opts = {
    jwtFromRequest: (req) => {
        return req.cookies.accessToken;
    },
    secretOrKey: "898df8ed2d81a3a39176f4799ec7b246c6843b589b85ce9a012a2be4be1844b1e9fb0d715efea7f9a4e5e936554c7bf6991c58a111fb11f6d59ea78cc0ceba34380653ae16447b2cc569e611e56f6f2b68ccf12198ba21ada26abdf3d96e07aa1964c29b6142da0410d35244c73aa39635bb107c0f3c96e4d7ff0190a127e35fd75eb7ee5eeb980ea8a7f1cede1fe2bc798041642ea32d9f1b07e575f9d093b2c412406fdd23cec68f08f42272399fad9b8c2e840094ff2a6292b0670fb6fd530f0552f5af82c933882fa16e878cd1ed4f6c725393996f498382d187446147810c518b9cac6065e5b33e02535e45eb4a40e9758d35581eaae0fe161988dc388d",
};

/** Passport Strategy Definition */
passport.use(new JwtStrategy(
    opts,
    async (jwt_payload, done) => {
        try {
            //Fetch the user from the user's stored in payload.
            const user = await User.findById(jwt_payload.id).select("-password");
            // console.log(jwt_payload)
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            console.error("Error :: Passport Config :: ", error);
            return done(error, false);
        }
    }))

/** Authorize Role 
 * @description Get's the role for which it is to be verified, 
 * accesses the token's payload and matches the role in the payload
 * with the role supplied, if it matches next() is called if not error
 * is thrown.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            // Check if the user's role is included in the allowed roles
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ msg: "Authorization Error :: Unauthorized Access Requested" });
            }

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error("Authorization Error :: Error in authorize middleware:", error);
            return res.status(403).json({ msg: "Authorization Error :: Invalid token" });
        }
    };
};

/** Passport Authenticate Middleware (Utilise the passport strategy defined) */
const authenticate = passport.authenticate('jwt', { session: false });


export { passport, authorize, authenticate };