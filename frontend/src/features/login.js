import api from "../utils/axios";

export const googleLogin = async (token) => {
    const { data } = await api.post("/api/auth/googleLogin", { token });
    return data;
}

export const emailLogin = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    return data;
}

export const registerUser = async (name, email, password) => {
    const { data } = await api.post("/api/auth/register", { name, email, password });
    return data;
}

export const logoutUser = async () => {
    const { data } = await api.post("/api/auth/logout");
    return data;
}