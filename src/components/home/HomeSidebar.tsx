import React from 'react';
import {
    LayoutDashboard,
    Compass,
    Flag,
    BookOpen,
    User,
    ShieldCheck,
    ArrowRight,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../store/useAuth';
import { SidebarItem } from './SidebarItem';

interface HomeSidebarProps {
    activeTab: 'Dashboard' | 'Mi Viaje' | 'Mis Retos' | 'Mis Recursos' | 'Perfil';
}

export const HomeSidebar = ({ activeTab }: HomeSidebarProps) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

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


                    {/* ///////Ocualtat/////// */}
                    {/* <SidebarItem
                        icon={Compass}
                        label="Mi Viaje"
                        active={activeTab === 'Mi Viaje'}
                        // disabled={true}
                        onClick={() => navigate('/journey')}
                    /> */}
                    <SidebarItem
                        icon={Flag}
                        label="Mis Retos"
                        active={activeTab === 'Mis Retos'}
                        onClick={() => navigate('/challenges')}
                    />
                    {/* <SidebarItem
                        icon={BookOpen}
                        label="Mis Recursos"
                        active={activeTab === 'Mis Recursos'}
                        onClick={() => navigate('/resources')}
                    /> */}
                    {/* ///////Ocualtat/////// */}

                    <SidebarItem
                        icon={User}
                        label="Perfil"
                        active={activeTab === 'Perfil'}
                        onClick={() => navigate('/profile')}
                    />
                </nav>
            </div>

            {/* Footer Sidebar */}
            <div className="p-6 border-t border-slate-50">
                <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-slate-50/50 border border-slate-100/50">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden flex-shrink-0">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            (user?.preferredName || user?.firstName || 'U')[0].toUpperCase()
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                            {user?.preferredName || user?.firstName || 'Usuario'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-medium">
                            {user?.membership?.replace('_', ' ') || 'Free'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        logout();
                        navigate('/');
                    }}
                    className="w-full text-slate-400 hover:text-rose-500 p-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-rose-50/50 text-xs font-bold uppercase tracking-widest"
                >
                    <LogOut size={16} />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
