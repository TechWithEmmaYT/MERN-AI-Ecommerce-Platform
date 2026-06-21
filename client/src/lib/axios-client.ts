import axios, { AxiosError } from "axios";
import { BASE_API_URL } from "./env";

interface CustomError extends AxiosError {
    errorCode?: string;
}
const options = {
    baseURL:BASE_API_URL,
    withCredentials: true,
    timeout: 10000,
};
const API = axios.create(options);

API.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const data = error.response?.data;
        //const status = error.response?.status;
        // if (data === "Unauthorized" && status === 401) {
        //     window.location.href = "/";
        // }
        const customError: CustomError = {
            ...error,
            errorCode: data?.errorCode || "UNKNOWN_ERROR",
        };
        return Promise.reject(customError);
    }
);

export default API;