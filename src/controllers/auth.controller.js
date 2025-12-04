import bcrypt from "bcrypt";
import User from "../models/auth.model.js";
import { generateTokenAndSetCookie } from "../../lib/generateTokenAndSetCookie.js";
// import { sendResetPasswordEmail, sendResetPasswordEmailSuccess, sendWelcomeEmail, verificationEmail } from "../../mailtrap/email.js";
import crypto from "crypto";
import { upsertStreamUser } from "../../lib/stream.js";
export const signUp = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({
                message: 'Please provide all required fields!',
            });
        }
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({
                message: 'User already exists!',
            });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(10000000 + Math.random() * 9000000).toString();
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;  // 1 day
        const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
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
        })
        await user.save();

        // StreamChat
        try {
            await upsertStreamUser({
                id: user._id.toString(),
                name: user.name,
                image: user.profilePic || "",
            });
            console.log(`Stream user created for ${user.name}`);
        } catch (error) {
            console.log("Error creating Stream user:", error);
        }

        generateTokenAndSetCookie(res, user._id);
        // await verificationEmail(email, verificationToken, name);
        return res.status(201).json({
            message: 'User created successfully!',
            user: {
                ...user._doc,
                password: undefined,
                email: user.email,
                name: user.name,
                verificationToken: user.verificationToken,
                verificationTokenExpires: user.verificationTokenExpires,
                gender: user.gender,
                profilePic: user.profilePic,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in the signUp controller!',
            error: error.message,
        });

    }
}

export const verifyEmail = async (req, res) => {
    const { verificationToken } = req.body;
    try {
        const user = await User.findOne({ verificationToken, verificationTokenExpires: { $gt: Date.now() } }).populate("friends", "name email bio profilePic")
        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired verification token!',
            });
        }
        if (user.isVerified) {
            return res.status(400).json({
                message: 'Email already verified!',
            });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        // await sendWelcomeEmail(user.email, user.name);
        return res.status(200).json({
            message: 'Email verified successfully!',
            user: {
                ...user._doc,
                password: undefined,
            },
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error in the verifyEmail controller!',
            error: error.message,
        });
    }
}

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found!',
            });
        }
        return res.status(200).json({
            message: 'User deleted successfully!',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in the deleteUser controller!',
            error: error.message,
        });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").populate("friends", "name email bio profilePic")
        return res.status(200).json({
            message: 'All users fetched successfully!',
            users: users.map(user => ({
                ...user._doc,
                password: undefined,
            })),
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in the getAllUsers controller!',
            error: error.message,
        });
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide all required fields!',
            });
        }
        const user = await User.findOne({ email }).populate("friends", "name email bio profilePic")
        if (!user) {
            return res.status(400).json({
                message: 'User not found!',
            });
        }
        if (!user.password) {
            return res.status(400).json({
                message: 'User password is missing!',
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials!',
            });
        }

        user.lastLogin = Date.now();
        generateTokenAndSetCookie(res, user._id);
        await user.save();
        return res.status(200).json({
            message: 'User logged in successfully!',
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in the signIn controller!',
            error: error.message,
        });
    }
};
export const logout = (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({
            message: 'Logged out successfully!',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in the logout controller!',
            error: error.message,
        });
    }
}
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: 'Please provide an email address!',
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'User not found!',
            });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
        await user.save();
        // Send the reset token to the user's email
        // await sendResetPasswordEmail(email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`, user.name);

        return res.status(200).json({
            message: 'Reset token sent to your email!',
            resetToken,
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Error in the forgotPassword controller!',
            error: error.message,
        });
    }
}
export const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { resetCode } = req.params;

    try {
        if (!resetCode || !password) {
            return res.status(400).json({
                message: 'Please provide all required fields!',
            });
        }
        const user = await User.findOne({
            resetPasswordToken: resetCode,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired reset token!',
            });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        // await sendResetPasswordEmailSuccess(user.email, `${process.env.CLIENT_URL}/login`, user.name);
        return res.status(200).json({
            message: 'Password reset successfully!',
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in the resetPassword controller!',
            error: error.message,
        });

    }
}

export const onboarding = async (req, res) => {
    try {
        const { profilePic, bio, location, gender } = req.body;
        if (!profilePic || !bio || !location || !gender) {
            return res.status(400).json({
                message: 'Please provide all required fields!',
            });
        }
        const user = await User.findById(req.userId).populate("friends", "name email bio profilePic")
        if (!user) {
            return res.status(404).json({
                message: 'User not found!',
            });
        }
        user.profilePic = profilePic;
        user.bio = bio;
        user.location = location;
        user.gender = gender;
        user.onboarding = true;

        await user.save();

        // StreamChat
        try {
            await upsertStreamUser({
                id: user._id.toString(),
                name: user.name,
                image: user.profilePic || "",
            });
            console.log(`Stream user updated for ${user.name}`);
        } catch (error) {
            console.log("Error updating Stream user:", error);
        }

        return res.status(200).json({
            message: 'Onboarding completed successfully!',
            user: {
                ...user._doc,
                onboarding: user.onboarding,
                password: undefined,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in the onboarding controller!',
            error: error.message,
        });
    }
}

export const checkAuth = async (req, res) => {
    try {
        // Ensure req.userId is set by middleware
        if (!req.userId) {
            return res.status(401).json({
                message: 'Unauthorized! User ID is missing in the request.',
            });
        }

        const user = await User.findById(req.userId)
            .populate('friends', 'name email profilePic bio ');


        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized! No user found.',
            });
        }

        return res.status(200).json({
            message: 'User authenticated successfully!',
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in the checkAuth controller!',
            error: error.message,
        });
    }
};