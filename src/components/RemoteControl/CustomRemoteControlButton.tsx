import React from 'react';
import { clsx } from 'clsx';

interface CustomRemoteControlButtonProps {
  imageSrc: string; // Đường dẫn đến hình ảnh (PNG/JPG)
  label: string;
  action: string;
  onClick: (action: string) => void;
  colorClass?: string;
  disabled?: boolean;
  isLocked?: boolean; // New prop to control the diagonal line overlay
}

const CustomRemoteControlButton: React.FC<CustomRemoteControlButtonProps> = ({
  imageSrc,
  label,
  action,
  onClick,
  colorClass = 'bg-gray-100', // Changed default background to light gray
  disabled = false,
  isLocked = false,
}) => {
  return (
    <button
      onClick={() => onClick(action)}
      disabled={disabled}
      className={clsx(
        'relative w-20 h-20 rounded-lg overflow-hidden flex flex-col items-center justify-center p-2 text-xs font-medium hover:opacity-90 transition-opacity',
        colorClass,
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title={label}
    >
      {/* Image takes up a portion of the button */}
      <img src={imageSrc} alt={label} className="w-12 h-12 object-contain" />
      
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Made the diagonal line thicker and span the full width for better visibility */}
          <div className="absolute w-full h-[3px] bg-red-600 transform rotate-45 origin-center"></div>
        </div>
      )}
      
      {/* Text is positioned below the image with some margin */}
      <span className="text-center leading-tight text-gray-900 text-[10px] font-semibold drop-shadow-sm mt-1">
        {label}
      </span>
    </button>
  );
};

export default CustomRemoteControlButton;