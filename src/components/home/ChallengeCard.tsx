import React from 'react';
import { ChevronRight } from 'lucide-react';
import { C } from '../../styles/colors';

interface ChallengeCardProps {
    icon: React.ElementType;
    category: string;
    title: string;
    subtitle: string;
    iconColor?: string;
    iconBg?: string;
}

export const ChallengeCard = ({ icon: Icon, category, title, subtitle, iconColor, iconBg }: ChallengeCardProps) => (
    <div className="border rounded-xl p-4 mb-3 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group" style={{ background: C.surface1, borderColor: C.border }}>
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ background: iconBg || C.surface3, color: iconColor || C.green }}>
                <Icon size={24} />
            </div>
            <div>
                <span className="text-[10px] font-bold tracking-wider uppercase border px-2 py-0.5 rounded-full" style={{ color: C.label, borderColor: C.border }}>
                    {category}
                </span>
                <h3 className="font-semibold mt-1 transition-colors group-hover:opacity-80" style={{ color: C.text }}>
                    {title}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: C.label }}>{subtitle}</p>
            </div>
        </div>
        <ChevronRight className="transition-colors group-hover:opacity-60" size={20} style={{ color: C.label }} />
    </div>
);
