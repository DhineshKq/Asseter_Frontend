// Loader.tsx
import React from 'react';
import styled from 'styled-components';

type LoaderProps = {
  variant?: 'fullscreen' | 'inline';
};

const Loader: React.FC<LoaderProps> = ({ variant = 'fullscreen' }) => {
  return (
    <StyledWrapper $variant={variant}>
      <div id="wifi-loader">
        <svg viewBox="0 0 86 86" className="circle-outer">
          <circle r={40} cy={43} cx={43} className="back" />
          <circle r={40} cy={43} cx={43} className="front" />
          <circle r={40} cy={43} cx={43} className="new" />
        </svg>
        <svg viewBox="0 0 60 60" className="circle-middle">
          <circle r={27} cy={30} cx={30} className="back" />
          <circle r={27} cy={30} cx={30} className="front" />
        </svg>
        <svg viewBox="0 0 34 34" className="circle-inner">
          <circle r={14} cy={17} cx={17} className="back" />
          <circle r={14} cy={17} cx={17} className="front" />
        </svg>
        <div data-text="Scanning" className="text" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $variant: 'fullscreen' | 'inline' }>`
  ${({ $variant }) =>
    $variant === 'fullscreen'
      ? `
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: rgb(170 167 167 / 36%);
    z-index: 99999;
  `
      : `
    position: relative;
    height: 100%;
    width: 100%;
    background-color: transparent;
  `}

  display: flex;
  justify-content: center;
  align-items: center;

  #wifi-loader {
    --background: #62abff;
    --back-color: #c3c8de;
    width: 64px;
    height: 64px;
    border-radius: 50px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
  }

  #wifi-loader svg {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #wifi-loader svg circle {
    fill: none;
    stroke-width: 6px;
    stroke-linecap: round;
    stroke-linejoin: round;
    transform: rotate(-100deg);
    transform-origin: center;
  }

  .back {
    stroke: var(--sidebar-selected-bg);
  }

  .front {
    stroke:var(--heading-fonts);

  }

  .circle-outer {
    height: 86px;
    width: 86px;
  }

  .circle-outer circle {
    stroke-dasharray: 62.75 188.25;
  }

  .circle-outer .back {
    animation: circle-outer135 1.8s ease infinite 0.3s;
  }

  .circle-outer .front {
    animation: circle-outer135 1.8s ease infinite 0.15s;
  }

  .circle-middle {
    height: 60px;
    width: 60px;
  }

  .circle-middle circle {
    stroke-dasharray: 42.5 127.5;
  }

  .circle-middle .back {
    animation: circle-middle6123 1.8s ease infinite 0.25s;
  }

  .circle-middle .front {
    animation: circle-middle6123 1.8s ease infinite 0.1s;
  }

  .circle-inner {
    height: 34px;
    width: 34px;
  }

  .circle-inner circle {
    stroke-dasharray: 22 66;
  }

  .circle-inner .back {
    animation: circle-inner162 1.8s ease infinite 0.2s;
  }

  .circle-inner .front {
    animation: circle-inner162 1.8s ease infinite 0.05s;
  }

  .text {
    position: absolute;
    bottom: -40px;
    text-transform: lowercase;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0.2px;
  }

  .text::before,
  .text::after {
    content: attr(data-text);
  }

  .text::before {
    color: var(--text-color);
  }

  .text::after {
    color: var(--side-panel-primary-bg);
    animation: text-animation76 3.6s ease infinite;
    position: absolute;
    left: 0;
  }

  @keyframes circle-outer135 {
    0% { stroke-dashoffset: 25; }
    25% { stroke-dashoffset: 0; }
    65% { stroke-dashoffset: 301; }
    80% { stroke-dashoffset: 276; }
    100% { stroke-dashoffset: 276; }
  }

  @keyframes circle-middle6123 {
    0% { stroke-dashoffset: 17; }
    25% { stroke-dashoffset: 0; }
    65% { stroke-dashoffset: 204; }
    80% { stroke-dashoffset: 187; }
    100% { stroke-dashoffset: 187; }
  }

  @keyframes circle-inner162 {
    0% { stroke-dashoffset: 9; }
    25% { stroke-dashoffset: 0; }
    65% { stroke-dashoffset: 106; }
    80% { stroke-dashoffset: 97; }
    100% { stroke-dashoffset: 97; }
  }

  @keyframes text-animation76 {
    0% { clip-path: inset(0 100% 0 0); }
    50% { clip-path: inset(0); }
    100% { clip-path: inset(0 0 0 100%); }
  }
`;

export default Loader;
