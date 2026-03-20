import React from 'react';
import styled from 'styled-components';

interface CardProps {
  label?: 'Basic' | 'Standard' | 'Premium' | 'Expired';
  width?: string;
  height?: string;
  children?: React.ReactNode;
  isExpired?: boolean; 
}

interface StyledWrapperProps {
  $width: string;
  $height: string;
  $label: string;
}

// Ribbon color based on plan type
const getRibbonColor = (label: string) => {
  switch (label) {
    case 'Basic':
      return 'linear-gradient(45deg, #7f8c8d, #95a5a6)'; // gray
    case 'Standard':
      return 'linear-gradient(45deg, #3498db, #2980b9)'; // blue
    case 'Premium':
      return 'linear-gradient(45deg, #f39c12, #e67e22)'; // gold-orange
    case 'Expired':
    default:
      return 'linear-gradient(45deg, #ff512f, #dd2476)'; // red-pink
  }
};

const SubscriptionCard: React.FC<CardProps> = ({
  label = 'Premium',
  width = '200px',
  height = '250px',
  children,
}) => {
  return (
    <StyledWrapper $width={width} $height={height} $label={label}>
      <div className="container">
        <div className="card_box">
          <span className="ribbon">{label}</span>
          <div className="card_content">{children}</div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<StyledWrapperProps>`
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .card_box {
    width: ${(props) => props.$width};
    height: ${(props) => props.$height};
    border-radius: 20px;
    background: linear-gradient(160deg, #333, #111);
    position: relative;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
  }

  .card_box:hover {
    transform: scale(1.07) translateY(-8px);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(15px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .ribbon {
    position: absolute;
    top: 20px;
    left: -36px;
    transform: rotate(-45deg);
    background: ${(props) => getRibbonColor(props.$label)};
    color: white;
    padding: 4px 40px;
    font-size: 0.75rem;
    font-weight: bold;
    letter-spacing: 1px;
    z-index: 3;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    text-transform: uppercase;
  }

  .card_content {
    position: relative;
    z-index: 1;
    padding: 1.2rem;
    color: #eee;
    width: 100%;
    text-align: left;
    left: 20px;
  }

  .card_content h3 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
    font-weight: 600;
    color: #fff;
  }

  .card_content p {
    margin: 0.3rem 0;
    font-size: 0.95rem;
    color: #bbb;
  }
`;

export default SubscriptionCard;
