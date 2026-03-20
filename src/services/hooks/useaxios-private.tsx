
import { useEffect } from "react";
import { getCookie } from "../utils/cookie-utils"
import { axiosPrivate } from "../../middleware/axios-api";

const useAxiosPrivate = () => {
 
    const token = getCookie('token');

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {

                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = token;
                }

                return config;
            }, (error) => Promise.reject(error)
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
        }
    }, [token])

    return axiosPrivate;
}

export default useAxiosPrivate;