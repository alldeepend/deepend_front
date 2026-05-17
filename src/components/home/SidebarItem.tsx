import React from 'react';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
    dark?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick, disabled = false, dark = false }: SidebarItemProps) => (
    <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`w-full flex items-center p-3 rounded-xl cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        style={{
            background: active ? (dark ? '#EE2A28' : undefined) : 'transparent',
            color: active ? (dark ? '#fff' : undefined) : (dark ? '#A8A29E' : undefined),
        }}
    >
        <Icon size={20} className={`mr-3 ${!dark && active ? 'text-blue-600' : !dark && !active ? 'text-gray-600' : ''}`} />
        <span className={`text-sm font-medium ${!dark && active ? 'text-blue-600' : !dark && !active ? 'text-gray-600' : ''}`}>{label}</span>
    </button>
);
