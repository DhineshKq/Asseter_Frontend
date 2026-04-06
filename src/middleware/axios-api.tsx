import axios from 'axios';
// export const Socket_Io = 'http://172.25.10.113:8002';
// const BASE_URL = 'http://172.25.10.113:8002/v1';
export const Socket_Io = 'http://172.26.10.44:8002';
const BASE_URL = 'http://172.26.10.44:8002/v1'; 



export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
});