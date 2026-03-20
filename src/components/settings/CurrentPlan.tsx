import { useEffect, useState } from 'react'
import '../../styles/pages/settings/currentPlan.scss'
import { axiosPrivate } from '../../middleware/axios-api';
import SubscriptionCard from '../../components/common-component/cards/subscriptionCard'
import { getPlanActive } from '../../services/utils/checkexpiration';

const allowedPlans = ['Basic', 'Standard', 'Premium'] as const;

export default function CurrentPlan() {
    const [planName, setPlanName] = useState("")
    const [assetsLimit, setAssetsLimit] = useState("")
    const [usedAssets, setUsedAssets] = useState("")
    const [remainingAssets, setRemainingAssets] = useState("")
    const [isPlanActive, setIsPlanActive] = useState(false)
    const [expiryDate, setExpiryDate] = useState("")

    const validPlanName = allowedPlans.includes(planName as any)
        ? (planName as 'Basic' | 'Standard' | 'Premium')
        : 'Expired';

    const formattedExpiry = expiryDate ? new Date(expiryDate).toLocaleDateString() : '';


    useEffect(() => {
        async function fetchScanData() {
            const scanData = await getPlanActive();
            if (scanData) {
                setIsPlanActive(scanData.isPlanActive)
                setExpiryDate(scanData.planExpiry)
            } else {
                console.log("Failed to fetch plan data.");
            }
        }

        fetchScanData();
    }, []);

    useEffect(() => {
        getSubscriptionAssetUsage()
    }, []);

    async function getSubscriptionAssetUsage() {
        try {
            const response = await axiosPrivate.get('/getSubscriptionAssetUsage');

            if (response.data.status) {
                setPlanName(response.data.plan)
                setAssetsLimit(response.data.assetLimit)
                setUsedAssets(response.data.usedAssets)
                setRemainingAssets(response.data.remainingAssets)
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
    }

    return (
        <div className="mainPage">
            <div className="plan-section">
                <SubscriptionCard
                    label={isPlanActive ? validPlanName : 'Expired'}
                    width="220px"
                    height="280px"
                    isExpired={!isPlanActive}>
                    {isPlanActive ? (
                        <>
                            <h3 className="card-title">Plan Details</h3>
                            <p>Assets Limit: {assetsLimit}</p>
                            <p>Added Assets: {usedAssets}</p>
                            <p>Remaining Assets: {remainingAssets}</p>
                            <p>Expiry Date: {formattedExpiry}</p>
                        </>
                    ) : (
                        <p className="expired-msg"><strong>Your plan has expired</strong></p>
                    )}
                </SubscriptionCard>

                <div className="plan-info">
                    <div className="plan-info">
                        {isPlanActive ? (
                            planName === 'Premium' ? (
                                <p className="premium-msg">You’re enjoying all Premium features 🚀</p>
                            ) : (
                                <>
                                    <p className="upgrade-msg">
                                        You are on a <strong>{planName}</strong> plan. To unlock more features and add more assets,
                                        upgrade your plan.
                                    </p>
                                    <button className="upgrade-btn">Upgrade Plan</button>
                                </>
                            )
                        ) : (
                            <>
                                <p className="expired-msg">
                                    Your plan has expired. Upgrade to continue enjoying our features.
                                </p>
                                <button className="upgrade-btn">Upgrade Plan</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

};
