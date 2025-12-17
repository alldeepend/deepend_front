import React from 'react';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full p-3 mb-2 rounded-lg transition-colors duration-200 ${active
            ? 'text-emerald-500 font-semibold bg-emerald-50/50'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
    >
        <Icon size={20} className="mr-3" />
        <span className="text-sm font-medium">{label}</span>
    </button>
);
