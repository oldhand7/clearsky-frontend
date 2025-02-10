import React from 'react';
import { CSSProperties } from 'react';

const typingIndicatorContainerStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
};

const dotStyle: CSSProperties = {
  width: '8px',
  height: '8px',
  backgroundColor: '#475466',
  borderRadius: '50%',
  animation: 'wave 1.2s infinite ease-in-out',
};

const middleDotStyle: CSSProperties = {
  ...dotStyle,
  backgroundColor: '#98a1b2',
  animationDelay: '0.2s',
};

const lastDotStyle: CSSProperties = {
  ...dotStyle,
  animationDelay: '0.4s',
};

const TypingIndicator: React.FC = () => {
  return (
    <div style={typingIndicatorContainerStyle}>
      <div style={dotStyle} />
      <div style={middleDotStyle} />
      <div style={lastDotStyle} />
    </div>
  );
};

export default TypingIndicator;

// Keyframes for wave animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes wave {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }
`;
document.head.appendChild(styleSheet);