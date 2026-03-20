import { axiosPrivate } from "../../middleware/axios-api";

export async function getListOfDomain(targetType: any) {
    try {
        const workspaceId = localStorage.getItem("workspaceId");

        const response = await axiosPrivate.post('getListOfDomain', {
            workspaceId,
            targetType
        });

        if (response.data.status) {
            return response.data.data.map((item: any) => ({
                value: item.id,
                label: item.targets
            }));
        } else {
            console.error("API responded with error:", response.data.message);
            return [];
        }
    } catch (error) {
        console.error("Error fetching asset data:", error);
        return [];
    }
}
