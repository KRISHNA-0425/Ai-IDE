import redis from "../../shared/redis/redis.js";

export const isAuth = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.session;

        if (!sessionId) {
            return res.status(401).json({ message: "user unauthorized" })
        }

        // getting the user data from redis
        const result = await redis.get(`session-${sessionId}`)

        if (!result) {
            return res.status(401).json({ message: "session not found" });
        }

        // converting into json
        const data = JSON.parse(result);

        // setting the user data into user in the req object 
        // so whenever we will be needing the data we can directly get from the middleware 
        req.user = data;

        next();

    } catch (error) {
        console.error("isAuth middleware error:", error);
        return res.status(500).json({ message: "error in the isAuth middleware" });
    }
}