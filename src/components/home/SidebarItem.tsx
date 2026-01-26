import React from 'react';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick, disabled = false }: SidebarItemProps) => (
    <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`
        flex items-center p-3 cursor-pointer transition-colors
        ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-gray-100'}
      `}
    >
        <Icon size={20} className="mr-3" />
        <span className="text-sm font-medium">{label}</span>
    </button>
);
