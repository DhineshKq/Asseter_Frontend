import { axiosPrivate } from '../../middleware/axios-api';


export async function getPlanActive() {
    try {
        const response = await axiosPrivate.get('/getPlanExpiry');

        if (response.data.status) {
            const { isPlanActive, planExpiry } = response.data.data;

            return {
                isPlanActive,
                planExpiry
            };
        } else {
            console.log("API responded with error:", response.data.message);
            return null;
        }
    } catch (error) {
        console.error("Error fetching plan expiry data:", error);
        return null;
    }
}
