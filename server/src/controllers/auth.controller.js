import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * User Registration
 * @description Registers a user in the DB.
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {response} 
 */
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    const verificationFile = req.file?.location;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User Already Exists!' });
        }

        // Create a new user
        user = new User({
            username,
            email,
            password: await bcrypt.hash(password, 10), // Directly hash the password
            role,
            verificationFile,
            isApproved: role !== 'owner',
            rating: {
                avgRating: 0,
                ratingCount: 0
            }
        });
        await user.save();
        res.status(201).json({ msg: "User Registered Successfully" });
    } catch (error) {
        console.error("Auth Controller :: Error Registering User", error);
        res.status(500).json({ msg: "Auth Controller :: Server Error" });
    }
};

/**
 * User login
 * @description Logs in a user and sets token in cookie.
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {response} 
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Auth Controller :: User Not Found!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Auth Controller :: Invalid credentials!" });
        }
        if (user.role === "owner" && !user.isApproved) {
            return res.status(403).json({ msg: "Auth Controller :: Account pending approval!" });
        }
        const { refreshToken, accessToken } = user.generateTokens();
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ msg: "Auth Controller :: Login Successful", user });
    } catch (error) {
        console.error("Auth Controller :: Error Logging In User", error);
        res.status(500).json({ msg: "Auth Controller :: Server Error" });
    }
};

/**
 * User logout
 * @description Logs out a user(clear the cookies)
 * @type {(req: any, res: any) => void}
 */
const logout = ((req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ msg: "Logged out successfully" });
});

/**
 * Token regeneration once the access token expires.
 * @description Regenerates the access token if the refresh token is valid.
 * @type {(req: any, res: any) => any}
 */
const regenerateToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ msg: "Auth Controller :: Unauthorized" });
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
        const accessToken = jwt.sign({ id: payload.id, role: payload.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ msg: "Auth Controller :: Access token refreshed" });
    } catch (error) {
        console.error("Auth Controller :: Invalid refresh token", error);
        res.clearCookie("refreshToken");
        res.status(403).json({ msg: "Auth Controller :: Invalid refresh token" });
    }
};

/**
 * Get Current User
 * @description Fetches the current user based on tokens.
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {response}
 */
const getCurrentUser = async (req, res) => {
    try {
        let accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return regenerateToken(req, res); // Reuse regenerateToken logic
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ msg: "Auth Controller :: User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Auth Controller :: Error fetching current user", error);
        res.status(500).json({ msg: "Auth Controller :: Server Error" });
    }
};

export const injectAdminUser = async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ username: "admin", role: "admin" });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("Rishu578@", 10); // Hash the password
            const adminUser = new User({
                username: "admin",
                email: "admin@example.com",
                password: hashedPassword,
                role: "admin",
                rating: {
                    avgRating: 0,
                    ratingCount: 0
                },
                isApproved: true
            });
            const user = await adminUser.save();
            console.log("Admin user created successfully.");
            res.status(200).json({
                msg: "Admin user created successfully!",
                user: user
            })
        } else {
            console.log("Admin user already exists.");
            res.status(400).json({
                msg: "Admin could not be created successfully!",
            })
        }
    } catch (error) {
        console.error("Error injecting admin user:", error);
    }
};

export { registerUser, loginUser, logout, regenerateToken, getCurrentUser };