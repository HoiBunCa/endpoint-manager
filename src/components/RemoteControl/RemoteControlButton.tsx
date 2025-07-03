import React from 'react';
import { LucideIcon } from 'lucide-react'; // Giữ lại để dự phòng hoặc nếu có icon Lucide nào đó vẫn cần dùng
import { clsx } from 'clsx';

interface RemoteControlButtonProps {
  imageSrc?: string; // Đường dẫn đến hình ảnh SVG
  label: string;
  action: string;
  onClick: (action: string) => void;
  colorClass?: string;
  disabled?: boolean;
}

const RemoteControlButton: React.FC<RemoteControlButtonProps> = ({
  imageSrc,
  label,
  action,
  onClick,
  colorClass = 'bg-blue-600',
  disabled = false,
}) => {
  return (
    <button
      onClick={() => onClick(action)}
      disabled={disabled}
      className={clsx(
        'flex flex-col items-center space-y-2 p-3 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity',
        colorClass,
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={label} className="w-5 h-5 text-white" />
      ) : (
        // Fallback if no imageSrc is provided, though for this task, it should always be provided
        <div className="w-5 h-5 flex items-center justify-center">?</div> 
      )}
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
};

export default RemoteControlButton;