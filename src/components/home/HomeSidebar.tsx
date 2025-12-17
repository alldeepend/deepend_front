import React from 'react';
import {
    LayoutDashboard,
    Compass,
    Flag,
    BookOpen,
    User,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { SidebarItem } from './SidebarItem';

interface HomeSidebarProps {
    activeTab: 'Dashboard' | 'Mi Viaje' | 'Mis Retos' | 'Mis Recursos' | 'Perfil';
}

export const HomeSidebar = ({ activeTab }: HomeSidebarProps) => {
    const navigate = useNavigate();

    return (
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between hidden md:flex flex-shrink-0 z-20">
            <div className="p-8">
                {/* Logo */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-slate-900">DeepEnd<span className="text-emerald-500">.</span></h1>
                    <p className="text-[10px] tracking-[0.2em] text-slate-400 font-medium mt-1">NAVIGATION SYSTEM</p>
                </div>

                {/* Menú */}
                <nav>
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={activeTab === 'Dashboard'}
                        onClick={() => navigate('/dashboard')}
                    />
                    <SidebarItem
                        icon={Compass}
                        label="Mi Viaje"
                        active={activeTab === 'Mi Viaje'}
                        onClick={() => navigate('/journey')}
                    />
                    <SidebarItem
                        icon={Flag}
                        label="Mis Retos"
                        active={activeTab === 'Mis Retos'}
                        onClick={() => navigate('/challenges')}
                    />
                    <SidebarItem
                        icon={BookOpen}
                        label="Mis Recursos"
                        active={activeTab === 'Mis Recursos'}
                        onClick={() => navigate('/resources')}
                    />
                    <SidebarItem
                        icon={User}
                        label="Perfil"
                        active={activeTab === 'Perfil'}
                        onClick={() => navigate('/profile')}
                    />
                </nav>
            </div>

            {/* Footer Sidebar */}
            <div className="p-6">
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl flex items-center justify-between group transition-all shadow-lg shadow-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                            <ShieldCheck size={18} className="text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium">Pasaporte DeepEnd</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </aside>
    );
}
