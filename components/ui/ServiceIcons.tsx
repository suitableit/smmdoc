import React from 'react';

interface ServiceIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const InstagramIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#E1306C", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill={color} stroke={color} />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="white" stroke="white" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" />
  </svg>
);

export const FacebookIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#1877F2", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill={color} stroke={color} />
  </svg>
);

export const TwitterIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#1DA1F2", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" fill={color} stroke={color} />
  </svg>
);

export const YoutubeIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#FF0000", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill={color} stroke={color} />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
  </svg>
);

export const TiktokIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#5F1DE8", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19.08 7.97A5.56 5.56 0 0 1 15 6.5a5.56 5.56 0 0 1-5.5-5.5h-3v13a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 5 0V14a10 10 0 0 0 5 1.36 10 10 0 0 0 10-10v-2a5.56 5.56 0 0 0 2.58.61z" fill="#FF004F" />
    <path d="M15 6.5a5.56 5.56 0 0 0 4.08 1.47A5.56 5.56 0 0 0 21.66 7V4a5.56 5.56 0 0 1-2.58.61A5.56 5.56 0 0 1 15 6.5z" fill="#00F2EA" />
  </svg>
);

export const SnapchatIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#FFFC00", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C9.03 2 7.5 3.5 7.5 6.5v2.5s-1.5 1-3 1c0 0 0 1 1 2c1 1 2 1 2 1s-.5 4-3.5 5c0 0 2 1 4 1c0 0 .5 2 2 2s2-2 4-2 2 2 4 2 2-2 2-2c2 0 4-1 4-1-3-1-3.5-5-3.5-5s1 0 2-1c1-1 1-2 1-2-1.5 0-3-1-3-1V6.5c0-3-1.53-4.5-4.5-4.5z" fill={color} />
    <path d="M8.5 15c0 0 .5 2 3.5 2s3.5-2 3.5-2" stroke="#5F1DE8" strokeWidth="0.5" />
  </svg>
);

export const TelegramIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#0088cc", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M5.5 12.5l3 1.5 1.5 4.5 1-2 4 2 3-11-12.5 5z" fill="white" />
    <path d="M9.5 14l7-4.5-5.5 5.5" fill="white" />
  </svg>
);

export const PinterestIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#E60023", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M12 5a7 7 0 0 0-2.5 13.5c-.1-.8-.2-2 .1-3l1-4.5s-.3-.5-.3-1.3c0-1.2.7-2.2 1.6-2.2.8 0 1.1.6 1.1 1.2 0 .7-.5 1.8-.7 2.8-.2.9.4 1.6 1.3 1.6 1.5 0 2.7-1.6 2.7-4 0-2-1.4-3.4-3.4-3.4-2.3 0-3.7 1.7-3.7 3.5 0 .7.3 1.4.6 1.8.1.1.1.2 0 .4l-.2.8c0 .2-.2.2-.3.1-1-.5-1.6-1.9-1.6-3 0-2.5 1.8-4.8 5.3-4.8 2.8 0 4.9 2 4.9 4.6 0 2.8-1.7 5-4.2 5-1 0-1.8-.5-2.1-1.1l-.6 2.2c-.2.8-.7 1.8-1 2.4.8.2 1.6.3 2.4.3a7 7 0 0 0 0-14z" fill="white" />
  </svg>
);

export const LinkedinIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#0A66C2", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="2" fill={color} />
    <path d="M8 10v8" stroke="white" strokeWidth="2" />
    <path d="M8 7V7.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 18v-5.5c0-1.5 2-2 2-2V10c0-1 1-2 2-2h0c1 0 2 1 2 2v8" stroke="white" strokeWidth="2" />
  </svg>
);

export const WebsiteIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#6366F1", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M2 12h20" stroke="white" strokeWidth="1.5" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="white" strokeWidth="1.5" />
  </svg>
);

// New icons added below

export const WhatsappIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#25D366", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 13.9 2.5 15.7 3.4 17.2L2 22L6.9 20.6C8.4 21.5 10.1 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M16.8 14.5C16.6 15.1 15.6 15.7 15 15.8C14.4 15.9 13.7 16 12 15.3C9.5 14.3 8 11.7 7.9 11.6C7.8 11.5 6.9 10.3 6.9 9C6.9 7.8 7.5 7.2 7.7 7C7.9 6.8 8.2 6.7 8.4 6.7C8.5 6.7 8.7 6.7 8.8 6.7C9 6.7 9.1 6.7 9.3 7.1C9.5 7.5 9.9 8.8 10 8.9C10.1 9 10.1 9.2 10 9.3C9.9 9.4 9.9 9.5 9.8 9.6C9.7 9.7 9.6 9.9 9.5 10C9.4 10.1 9.3 10.2 9.4 10.4C9.5 10.6 9.9 11.3 10.6 11.9C11.4 12.6 12.1 12.9 12.3 13C12.5 13.1 12.7 13.1 12.8 12.9C12.9 12.8 13.3 12.3 13.4 12.1C13.5 11.9 13.7 11.9 13.9 12C14.1 12.1 15.3 12.7 15.5 12.8C15.7 12.9 15.8 13 15.9 13C16 13.2 16 14 15.8 14.5H16.8Z" fill="white" />
  </svg>
);

export const DiscordIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#5865F2", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.898-.608 1.297a19.97 19.97 0 0 0-5.487 0 12.78 12.78 0 0 0-.617-1.297.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055c1.993 1.474 3.954 2.384 5.88 2.988a.078.078 0 0 0 .086-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106c-.653-.248-1.274-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.292a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127c-.598.344-1.22.644-1.873.892a.077.077 0 0 0-.041.106c.36.698.772 1.362 1.225 1.994a.076.076 0 0 0 .086.028c1.934-.606 3.895-1.516 5.888-2.99a.077.077 0 0 0 .03-.055c.5-5.177-.838-9.674-3.549-13.442a.061.061 0 0 0-.031-.027" fill={color} />
    <path d="M8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" fill="white" />
  </svg>
);

export const SpotifyIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#1DB954", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M16.8 10.2c-2.1-1.3-5.6-1.3-7.6-.7-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7 2.3-.7 6.1-.6 8.5.9.3.2.4.5.2.8-.2.2-.5.3-.8.1zm-.3 2.5c-.2.2-.5.3-.7.1-1.8-1.1-4.4-1.4-6.5-.8-.2 0-.4-.1-.5-.3 0-.2.1-.4.3-.5 2.4-.7 5.3-.4 7.4.9.1.2.1.5-.1.7h.2zm-1.3 2.3c-.1.2-.4.2-.6.1-1.5-.9-3.5-1.1-5.7-.6-.2 0-.4-.1-.5-.3 0-.2.1-.4.3-.5 2.5-.6 4.7-.3 6.4.7.2.1.3.4.1.6z" fill="white" />
  </svg>
);

export const ThreadsIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#5F1DE8", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12.9 16.6c-1.6.2-3-.3-4.3-1.3-1-1.1-1.7-2.4-1.8-3.8-.2-3.3 1.7-5.2 4.2-5.4 1.3-.2 2.5.3 3.5 1.1 1.9 1.5 2.5 3.5 2.2 5.8-.4 2.2-1.8 3.4-3.8 3.6z" fill={color} />
    <path d="M13.3 9.3c-.5-.5-1.2-.8-2-.7-1.6.1-2.8 1.3-2.7 3.4.1.9.5 1.7 1.1 2.4.8.6 1.7.9 2.7.8 1.3-.1 2.2-.9 2.4-2.3.2-1.5-.1-2.7-1.5-3.6z" fill="white" />
    <path d="M15.1 17.2c.1-.1.2-.2.3-.3.6-.7.9-1.6.9-2.5 0-.2 0-.5-.1-.7 0-.1 0-.2.1-.2.6-.7.8-1.6.7-2.5-.1-.9-.5-1.7-1.1-2.3-.1-.1-.2-.2-.3-.3.1-.1.2-.2.3-.3 1.1-1 2.5-1.2 3.8-.7 1.3.5 2.1 1.5 2.3 2.9.2 1.4-.2 2.7-1.3 3.7-.1.1-.2.2-.3.3.1.1.2.2.3.3.9.9 1.3 2 1.2 3.3-.1 1.3-.7 2.3-1.8 3-1.1.7-2.3.8-3.5.3-1.2-.5-2-1.4-2.4-2.6-.1-.2-.1-.4-.2-.6.3-.2.7-.4 1.1-.5z" fill={color} />
    <path d="M9.1 17.2c-.1-.1-.2-.2-.3-.3-.6-.7-.9-1.6-.9-2.5 0-.2 0-.5.1-.7 0-.1 0-.2-.1-.2-.6-.7-.8-1.6-.7-2.5.1-.9.5-1.7 1.1-2.3.1-.1.2-.2.3-.3-.1-.1-.2-.2-.3-.3-1.1-1-2.5-1.2-3.8-.7-1.3.5-2.1 1.5-2.3 2.9-.2 1.4.2 2.7 1.3 3.7.1.1-.2.2-.3.3.1.1-.2.2-.3.3-.9.9-1.3 2-1.2 3.3.1 1.3.7 2.3 1.8 3 1.1.7 2.3.8 3.5.3 1.2-.5 2-1.4 2.4-2.6.1-.2.1-.4.2-.6-.3-.2-.7-.4-1.1-.5z" fill={color} />
  </svg>
);

export const RedditIcon: React.FC<ServiceIconProps> = ({ size = 24, color = "#FF4500", className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M18 11.5a1.5 1.5 0 1 0-3 0c0 .28.07.54.2.77-.57.38-1.28.72-2.1.94-.32-.7-.8-1.04-1.1-1.21v-.03c0-1.12-.9-2.02-2-2.02-1.1 0-2 .9-2 2 0 .24.04.47.12.68C6.77 12.2 6 12.84 6 13.5c0 .93.7 1.7 1.6 1.8.37.7.83 1.25 1.34 1.68.85.72 1.88 1.02 3.01 1.02 1.13 0 2.16-.3 3.01-1.02.51-.43.97-.98 1.34-1.68.9-.1 1.6-.87 1.6-1.8 0-.66-.77-1.3-2.12-1.87.08-.21.12-.44.12-.68z" fill="white" />
    <circle cx="9" cy="13" r="1.25" fill={color} />
    <circle cx="15" cy="13" r="1.25" fill={color} />
    <path d="M14.5 16c-.65.65-1.7.65-2.35 0" stroke={color} strokeWidth="1" />
  </svg>
); 