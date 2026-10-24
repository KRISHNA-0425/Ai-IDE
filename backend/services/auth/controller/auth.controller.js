import { app } from "../config/firebase.js";
import { getAuth } from 'firebase-admin/auth'
import User from "../model/userSchema.js";

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        // finding the user from the we got from the user
        const decoded = await getAuth(app).verifyIdToken(token);
        // console.log(decoded)

        let user = await User.findOne({
            firebaseId: decoded.uid
        })

        if(!user){
            user = User.create({
                firebaseId: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            }) 
        }

        

    } catch (error) {
        return res.status(500).json({ message: "internal server error" });
    }
}