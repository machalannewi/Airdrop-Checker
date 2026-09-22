import User from "../Models/user.js";

const checkSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (!user.isSubscribed) {
            return res.status(403).json({ msg: "You must be subscribed to access this feature" });
        }

        next();
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};

export default checkSubscription;
