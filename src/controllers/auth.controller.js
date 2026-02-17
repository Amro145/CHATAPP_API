import bcrypt from "bcrypt";
import User from "../models/auth.model.js";
import { generateTokenAndSetCookie } from "../../lib/generateTokenAndSetCookie.js";
import crypto from "crypto";
import { upsertStreamUser } from "../../lib/stream.js";

const formatUserResponse = (user) => {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.verificationToken;
    delete userObj.verificationTokenExpires;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;
    return userObj;
};

export const signUp = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide all required fields!' });
        }
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ message: 'User already exists!' });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(10000000 + Math.random() * 9000000).toString();
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const user = new User({
            email,
            password: hashPassword,
            name,
            verificationToken,
            verificationTokenExpires,
            lastLogin: Date.now(),
            isVerified: false,
            bio: "",
            location: "",
            onboarding: false,
            gender: "male",
            profilePic: randomAvatar,
        });
        await user.save();

        try {
            await upsertStreamUser({
                id: user._id.toString(),
                name: user.name,
                image: user.profilePic || "",
            });
        } catch (error) {
            console.error("Error creating Stream user:", error);
        }

        generateTokenAndSetCookie(res, user._id);
        return res.status(201).json({
            message: 'User created successfully!',
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error in signUp', error: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { verificationToken } = req.body;
    try {
        const user = await User.findOne({
            verificationToken,
            verificationTokenExpires: { $gt: Date.now() }
        }).populate("friends", "name email bio profilePic");

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token!' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified!' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        return res.status(200).json({
            message: 'Email verified successfully!',
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error in verifyEmail', error: error.message });
    }
}

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        return res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Error in deleteUser', error: error.message });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").populate("friends", "name email bio profilePic");
        return res.status(200).json({
            message: 'All users fetched successfully!',
            users: users.map(user => formatUserResponse(user)),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error in getAllUsers', error: error.message });
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields!' });
        }
        const user = await User.findOne({ email }).populate("friends", "name email bio profilePic");
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials!' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials!' });
        }

        user.lastLogin = Date.now();
        generateTokenAndSetCookie(res, user._id);
        await user.save();

        return res.status(200).json({
            message: 'User logged in successfully!',
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error in signIn', error: error.message });
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'Logged out successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Error in logout', error: error.message });
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address!' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000;
        await user.save();

        return res.status(200).json({
            message: 'Reset token generated!',
            resetToken, // In production, this should only be sent via email
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error in forgotPassword', error: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { resetCode } = req.params;

    try {
        if (!resetCode || !password) {
            return res.status(400).json({ message: 'Please provide all required fields!' });
        }
        const user = await User.findOne({
            resetPasswordToken: resetCode,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token!' });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Error in resetPassword', error: error.message });
    }
}

export const onboarding = async (req, res) => {
    try {
        const { profilePic, bio, location, gender } = req.body;
        if (!profilePic || !bio || !location || !gender) {
            return res.status(400).json({ message: 'Please provide all required fields!' });
        }
        const user = await User.findById(req.userId).populate("friends", "name email bio profilePic");
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        user.profilePic = profilePic;
        user.bio = bio;
        user.location = location;
        user.gender = gender;
        user.onboarding = true;
        await user.save();

        try {
            await upsertStreamUser({
                id: user._id.toString(),
                name: user.name,
                image: user.profilePic || "",
            });
        } catch (error) {
            console.error("Error updating Stream user:", error);
        }

        return res.status(200).json({
            message: 'Onboarding completed successfully!',
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error in onboarding', error: error.message });
    }
}

export const checkAuth = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        const user = await User.findById(req.userId).populate('friends', 'name email profilePic bio ');
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        return res.status(200).json({
            message: 'Authenticated successfully',
            user: formatUserResponse(user),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error in checkAuth', error: error.message });
    }
};