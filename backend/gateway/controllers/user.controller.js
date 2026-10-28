export const currentUser = async (req, res) => {
    try {
        const user = req.user;
        if(!user){
            return res.status(401).json({ message: "user unauthorized" })
        }

        return res.status(200).json(user)

    } catch (error) {
            return res.status(500).json({ message: "error in the get current user controller" })
    }
}