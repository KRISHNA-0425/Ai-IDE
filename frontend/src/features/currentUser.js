import api from "../utils/axios"

export const currentUser = async () => {
    try {
        const { data } = await api.get('/api/currentUser');
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
}