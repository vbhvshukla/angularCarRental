import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { sendEmail } from "../services/mail.service.js";
/**
 * Get User by ID
 * @description Fetches a user by their ID.
 * @async
 * @param {*} req 
 * @param {*} res 
 */
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "User Controller :: User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("User Controller :: Error fetching user by ID", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * Get All Users
 * @description Fetches all users.
 * @async
 * @param {*} req 
 * @param {*} res 
 */
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await User.find({ role: { $ne: 'admin' } })
            .select("-password")
            .skip((page - 1) * limit)
            .limit(limit);
        res.status(200).json(users);
    } catch (error) {
        console.error("User Controller :: Error fetching all users", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * Approve User
 * @description Approves a user by setting `isApproved` to true.
 * @async
 * @param {*} req 
 * @param {*} res 
 */
const approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true });
        if (!user) {
            return res.status(404).json({ msg: "User Controller :: User not found" });
        }
        sendEmail({
            to: user.email,
            subject: "Account Approved",
            text: "Your account has been approved",
        })
        res.status(200).json({ msg: "User approved successfully", user });
    } catch (error) {
        console.error("User Controller :: Error approving user", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * Reject User
 * @description Rejects a user by setting `isApproved` to false.
 * @async
 * @param {*} req 
 * @param {*} res 
 */
const rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, { isApproved: false }, { new: true });
        if (!user) {
            return res.status(404).json({ msg: "User Controller :: User not found" });
        }
        res.status(200).json({ msg: "User rejected successfully", user });
    } catch (error) {
        console.error("User Controller :: Error rejecting user", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * Update Password
 * @description Updates the password of a user.
 * @async
 * @param {*} req 
 * @param {*} res 
 */
const updatePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
        if (!user) {
            return res.status(404).json({ msg: "User Controller :: User not found" });
        }
        res.status(200).json({ msg: "Password updated successfully" });
    } catch (error) {
        console.error("User Controller :: Error updating password", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

const validatePassword = async (req, res) => {
    try {
        const { userId, password } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        const isValid = await bcrypt.compare(password, user.password);
        res.status(200).json({ isValid });
    } catch (error) {
        console.error("User Controller :: Error validating password", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

export { getUserById, validatePassword, getAllUsers, approveUser, rejectUser, updatePassword };