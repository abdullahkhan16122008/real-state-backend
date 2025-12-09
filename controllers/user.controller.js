const User = require("../models/user");

let updateUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hash password (important)

        const updated = await User.updateOne(
            { username: username },  // filter
            { 
                $set: { 
                    username: username,
                    password: password
                }
            }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Wrong username",
                success: false
            });
        }

        return res.status(200).json({
            message: "User updated successfully!",
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

module.exports = {
    updateUser
};