import axios from 'axios';
// const BASE_URL = 'https://172.25.10.44:443';
export const Socket_Io = 'http://172.25.10.113:8000';
// const BASE_URL = 'https://172.26.10.44:443/v1'; 
const BASE_URL = 'http://172.25.10.113:8000/v1';
// const BASE_URL = 'http://172.26.10.111:3000/v1';
// const BASE_URL = 'https://172.26.10.110:3001/v1'; 
// const BASE_URL = 'http://172.26.10.143:8080/v1';
// const BASE_URL = 'http://172.26.10.109:3003/v1';
// const BASE_URL = 'http://172.26.10.105:3003/v1';
// const BASE_URL = 'http://172.26.10.144:3000/v1';
// const BASE_URL = 'http://172.26.10.109:3000/v1';


export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
});