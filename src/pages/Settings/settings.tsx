import React, { useEffect, useRef, useState } from 'react'
import '../../styles/pages/settings/settings.scss'
import { axiosPrivate } from '../../middleware/axios-api'
import '../../styles/common-component/page-heading.scss'
import UserDetails from '../../components/settings/user-details'
import WorkspaceSettings from '../../components/settings/workspace'
import CurrentPlan from '../../components/settings/CurrentPlan'

const tabList = ['User Details', 'Environments', 'Current Plan'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('User Details');
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const index = tabList.indexOf(activeTab);
    const tabElement = tabRefs.current[index];

    if (tabElement) {
      setSliderStyle({
        left: tabElement.offsetLeft,
        width: tabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
        case 'User Details':
            return <UserDetails />;
        case 'Environments':
            return <WorkspaceSettings />;
        case 'Current Plan':
            return <CurrentPlan />;
        default:
            return null;
    }
};

  return (
    <div className="dashboard-main-page">
      <h2 className="pageHeading">Settings</h2>
      <div className="tab-switcher">
        <div className="tab-pill-background">
          {tabList.map((tab, index) => (
            <button
              key={tab}
              ref={(el) => (tabRefs.current[index] = el)}
              className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <div
            className="tab-slider"
            style={{
              left: sliderStyle.left,
              width: sliderStyle.width,
            }}
          />
        </div>
      </div>

      <div className="Content-container">{renderTabContent()}</div>
    </div>
  );
}
