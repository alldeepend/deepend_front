import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ChallengeCardProps {
    icon: React.ElementType;
    category: string;
    title: string;
    subtitle: string;
    colorClass: string;
}

export const ChallengeCard = ({ icon: Icon, category, title, subtitle, colorClass }: ChallengeCardProps) => (
    <div className="bg-white border border-slate-100 rounded-xl p-4 mb-3 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} />
            </div>
            <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase border border-slate-200 px-2 py-0.5 rounded-full">
                    {category}
                </span>
                <h3 className="text-slate-800 font-semibold mt-1 group-hover:text-emerald-600 transition-colors">
                    {title}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
            </div>
        </div>
        <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
    </div>
);
