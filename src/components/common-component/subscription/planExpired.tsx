import React, { useEffect, useState } from 'react'
import '../../../styles/pages/subcription/planExpiry.scss'

interface propsType {
    type: 'expired' | 'insufficient';
    setassetsPageView: (val: string) => void;
    cancelPageView: string;
}


export default function PlanExpired({ type, setassetsPageView, cancelPageView }: propsType) {
    const isExpired = type === 'expired';
    const cancelActoin = () => {
        setassetsPageView("Grid")

    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                cancelActoin();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);



    return (
        <div className="plan_expiry">
            <div className="container">
                <div className="warning-icon">⚠️</div>
                <h2 className="pageHeading">
                    {isExpired ? 'Your Plan Has Expired' : 'Your Plan Doesn’t Support This Feature'}
                </h2>
                <div className="heading-line"></div>
                <p className="description">
                    {isExpired
                        ? 'You no longer have access to this feature because your subscription plan has expired. Please renew your plan to continue using this feature.'
                        : 'Your current plan does not include access to this feature. Upgrade your plan to unlock all functionalities.'}
                </p>

                <div className="buttons">
                    <button className="renew-btn" onClick={() => alert("Redirect to upgrade plan page")}>
                        Upgrade Plan
                    </button>
                    <button className="cancel-btn" onClick={cancelActoin}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );


}