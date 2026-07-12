import React from 'react';
import { C } from '../../styles/colors';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
    dark?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick, disabled = false, dark = true }: SidebarItemProps) => (
    <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`w-full flex items-center p-3 rounded-xl cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        style={{
            background: active ? C.surface3 : 'transparent',
            color: active ? C.text : C.textMuted,
        }}
    >
        <Icon size={20} className="mr-3" />
        <span className="text-sm font-medium">{label}</span>
    </button>
);
