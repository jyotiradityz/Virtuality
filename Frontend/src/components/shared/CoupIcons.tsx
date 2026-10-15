import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 👑 Duke - Royal Crown
export const DukeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M3 18h18v2H3v-2zm1-3l3.5-7 4.5 4 4.5-4 3.5 7H4zm1-8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm14 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
);

// 🗡️ Assassin - Deadly Dagger
export const AssassinIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 4L20 9.5l-9 9-4-1-1-4 9-9.5z" />
    <path d="M3 21l3-3" />
    <path d="M14.5 4l2.5-2.5 3 3L17.5 7" />
  </svg>
);

// ⚓ Captain - Maritime Steering Wheel / Anchor
export const CaptainIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// 📜 Ambassador - Wax Sealed Scroll
export const AmbassadorIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 2h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2z" />
    <path d="M9 7h6M9 11h6M9 15h4" />
    <circle cx="15" cy="17" r="2" fill="currentColor" />
  </svg>
);

// 🛡️ Contessa - Regal Shield
export const ContessaIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2L4 5v6.5C4 16.5 7.5 21 12 22c4.5-1 8-5.5 8-10.5V5l-8-3z" />
    <path d="M12 6v12M8 10h8" />
  </svg>
);

// 💵 Income - Single Gold Coin
export const IncomeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v8M9.5 10a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2s-2.5.5-2.5 2a2.5 2.5 0 005 0" />
  </svg>
);

// 🌐 Foreign Aid - Diplomatic Tribute
export const ForeignAidIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8M3.6 15h16.8" />
    <path d="M12 3a15 15 0 000 18 15 15 0 000-18z" />
  </svg>
);

// 💰 Tax - Royal Treasury
export const TaxIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12V7H3v5M3 12v7h18v-7" />
    <circle cx="12" cy="13" r="2" />
    <path d="M6 7V4h12v3" />
  </svg>
);

// 👮 Steal - Pouch / Pillage
export const StealIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 11l-3-7H8L5 11" />
    <path d="M5 11c0 5 3.5 9 7 9s7-4 7-9H5z" />
    <circle cx="12" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

// 💀 Assassinate - Lethal Skull
export const AssassinateIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 18h6v3H9z" />
    <path d="M5 11c0-4.4 3.1-8 7-8s7 3.6 7 8c0 3.3-1.6 5.5-3 6.5H8C6.6 16.5 5 14.3 5 11z" />
    <circle cx="9" cy="11" r="1.5" fill="currentColor" />
    <circle cx="15" cy="11" r="1.5" fill="currentColor" />
  </svg>
);

// 🤝 Exchange - Dual Exchange Cards
export const ExchangeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 10h14l-4-4" />
    <path d="M17 14H3l4 4" />
  </svg>
);

// ⚔️ Coup - Crossed Broadswords
export const CoupSwordsIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 4L20 9.5l-9 9-4-1-1-4 9-9.5z" />
    <path d="M4 20l2-2" />
    <path d="M9.5 4L4 9.5l9 9 4-1 1-4-9-9.5z" />
    <path d="M20 20l-2-2" />
  </svg>
);

// 🎯 Target Crosshair
export const TargetIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
);

// Checkmark & Cross
export const CheckIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CrossIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Noble Crest (used on Coins instead of ₿)
export const CoinCrestIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 14.6 7.1 17.2l.9-5.5-4-3.9 5.5-.8L12 2z" />
  </svg>
);

// Copy & Share
export const CopyIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

// Mobile Phone LAN QR / Device Icon
export const DevicesIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="2" width="16" height="20" rx="3" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </svg>
);
