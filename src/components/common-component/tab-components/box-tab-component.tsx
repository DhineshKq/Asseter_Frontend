import React from 'react'
import '../../../styles/common-component/box-tab-component.scss'
interface BoxTabComponentProps {
    tabs: any[]
    tab: string
    handleTabClick: (val: any) => void;
    Wrapperstyle?: React.CSSProperties; // Restricting to CSSProperties type
    tabstyle?: React.CSSProperties;
    activetabstyle?: React.CSSProperties;
}

export default function BoxTabComponent({ tabs, Wrapperstyle, tabstyle, activetabstyle, tab, handleTabClick }: BoxTabComponentProps) {
    return (
        <div className='box-tab-component-wrapper' style={{ ...Wrapperstyle, gridTemplateColumns: `repeat(auto-fill, minmax(calc(100% / ${tabs.length}), 1fr))` }}>
            {
                tabs.map((t) => (
                    <div
                        key={t}
                        className={`box-tab-component ${tab === t ? 'active' : ''}`}
                        style={tab === t ? activetabstyle : tabstyle}
                        onClick={() => {
                            handleTabClick(t)
                        }}
                    >
                        {t}
                    </div>
                ))
            }
        </div>
    )
}
