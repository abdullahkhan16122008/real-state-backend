const jwt = require("jsonwebtoken");
const User = require("../models/user");


let updateUser = async (req, res) => {
    try {
        const { currentPassword, newUsername, newPassword } = req.body;

        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(201).json({
                message: "Unauthorized. No token provided.",
                success: false
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(201).json({
                message: "Invalid or expired token",
                success: false
            });
        }

        const currentUsernameFromToken = decoded.username;

        // Step 2: Find user
        const user = await User.findOne({ username: currentUsernameFromToken });
        if (!user) {
            return res.status(204).json({
                message: "User not found",
                success: false
            });
        }

        // Step 3: Verify current password
        if (user.password !== currentPassword) {
            return res.status(200).json({
                message: "Current password is incorrect",
                success: false
            });
        }

        const updateFields = {};

        if (newUsername && newUsername !== currentUsernameFromToken) {
            // Optional: check if new username already exists
            const existing = await User.findOne({ username: newUsername });
            if (existing) {
                return res.status(201).json({
                    message: "Username already taken",
                    success: false
                });
            }
            updateFields.username = newUsername;
        }

        if (newPassword) {
            updateFields.password = newPassword;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(200).json({
                message: "No changes made",
                success: true
            });
        }

        // Step 5: Update user
        const updated = await User.updateOne(
            { username: currentUsernameFromToken },
            { $set: updateFields }
        );

        if (updated.modifiedCount === 0) {
            return res.status(201).json({
                message: "Failed to update profile",
                success: false
            });
        }

        const newAccessToken = jwt.sign(
            { username: newUsername || currentUsernameFromToken },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 15
        });

        return res.status(200).json({
            message: "Profile updated successfully!",
            success: true
        });

    } catch (err) {
        console.error("Update profile error:", err);
        return res.status(200).json({
            message: "Internal Server Error",
            success: false
        });
    }
};


let loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        let check = await User.findOne({ username });


        if (!check) {
            return res.status(201).json({ message: 'Wrong Username', success: false })
        }
        if (check.password !== password) {
            return res.status(201).json({ message: 'Wrong Password', success: false })
        }

        let token = jwt.sign({ username: check.username }, process.env.JWT_SECRET, { expiresIn: '15m' })
        let refreshToken = jwt.sign({ username: check.username }, process.env.JWT_REFRESH_SECRET, { expiresIn: '1y' })


        res.cookie('accessToken', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 15
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 356
        })


        return res.status(200).json({
            message: "Logged In Successfully!",
            success: true
        });

    } catch (err) {
        return res.status(201).json({
            message: "Internal Server Error",
            error: err.message,
            success: false
        });
    }
};


let verifyToken = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken; // Fixed: was incorrectly reading accessToken again

        // Case 1: No tokens at all
        if (!accessToken && !refreshToken) {
            return res.status(201).json({
                message: 'Access Denied. No tokens provided.',
                success: false
            });
        }

        // Case 2: Access token exists → verify it
        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                // Token is valid → user is authenticated
                return res.status(200).json({
                    message: 'Token verified successfully',
                    success: true,
                    user: { username: decoded.username }
                });
            } catch (err) {
                // Access token expired or invalid, but we have refresh token?
                if (err.name === 'TokenExpiredError' && refreshToken) {
                    // Proceed to refresh logic
                } else {
                    // Invalid access token and no valid refresh → force login
                    return res.status(201).json({
                        message: 'Invalid access token',
                        success: false
                    });
                }
            }
        }

        // Case 3: No valid access token, but refresh token exists → try to refresh
        if (!accessToken || !jwt.verify(accessToken, process.env.JWT_SECRET)) {
            if (!refreshToken) {
                return res.status(201).json({
                    message: 'Session expired. Please login again.',
                    success: false
                });
            }

            try {
                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

                // Generate new access token
                const newAccessToken = jwt.sign(
                    { username: decodedRefresh.username },
                    process.env.JWT_SECRET,
                    { expiresIn: '15m' }
                );

                // Set new access token in cookie
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,     // Must be true in production (HTTPS)
                    maxAge: 1000 * 60 * 15 // 15 minutes
                });

                return res.status(200).json({
                    message: 'Token refreshed successfully',
                    success: true,
                    user: { username: decodedRefresh.username }
                });

            } catch (refreshErr) {
                // Refresh token also invalid/expired
                return res.status(401).json({
                    message: 'Refresh token invalid or expired. Please login again.',
                    success: false
                });
            }
        }

    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false,
            error: err.message
        });
    }
};

let logoutUser = async (req, res) => {
    try {

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({message: 'Logged Out Successfully', success: true})
    } catch (err) {
        return res.status(201).json({message: 'Error:', err})
    }
}
module.exports = {
    updateUser,
    loginUser,
    verifyToken,
    logoutUser
};