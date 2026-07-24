import React from 'react';
import {
    LayoutDashboard,
    Compass,
    Flag,
    BookOpen,
    User,
    ShieldCheck,
    ArrowRight,
    LogOut,
    Globe,
    Newspaper,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../store/useAuth';
import { SidebarItem } from './SidebarItem';
import { C } from '../../styles/colors';

interface HomeSidebarProps {
    activeTab: 'Dashboard' | 'Mi Viaje' | 'Mis Retos' | 'Mis Recursos' | 'Perfil' | 'Mundos' | 'Noticias';
    dark?: boolean;
}

export const HomeSidebar = ({ activeTab, dark = true }: HomeSidebarProps) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const bg      = dark ? '#231F20' : '#ffffff'
    const border  = dark ? '#333330' : '#f1f5f9'
    const text    = dark ? '#F5F0E8' : '#1e293b'
    const muted   = dark ? '#A8A29E' : '#94a3b8'
    const userBg  = dark ? '#1E1A1B' : '#f8fafc'

    return (
        <aside
            className={`w-64 flex flex-col justify-between hidden md:flex flex-shrink-0 z-20 sticky top-0 overflow-y-auto${dark ? ' dark-scrollbar' : ''}`}
            style={{ background: bg, borderRight: `1px solid ${border}`, height: '100dvh' }}
        >
            <div className="p-8">
                {/* Logo */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold" style={{ color: text }}>DeepEnd<span style={{ color: '#52B788' }}>.</span></h1>
                    <p className="text-[10px] tracking-[0.2em] font-medium mt-1" style={{ color: muted }}>NAVIGATION SYSTEM</p>
                </div>

                {/* Menú */}
                <nav>
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={activeTab === 'Dashboard'}
                        onClick={() => navigate('/dashboard')}
                        dark={dark}
                    />
                    {/* ///////Ocualtat/////// */}
                    {/* <SidebarItem
                        icon={Compass}
                        label="Mi Viaje"
                        active={activeTab === 'Mi Viaje'}
                        // disabled={true}
                        onClick={() => navigate('/journey')}
                    /> */}
                    {['test', 'worldtest1', 'worldtest2'].includes(user?.membership ?? '') && (
                        <SidebarItem
                            icon={Globe}
                            label="Mundos & Viajes"
                            active={activeTab === 'Mundos'}
                            onClick={() => navigate('/worlds')}
                            dark={dark}
                        />
                    )}
                    <SidebarItem
                        icon={Flag}
                        label="Mis Retos"
                        active={activeTab === 'Mis Retos'}
                        onClick={() => navigate('/challenges')}
                        dark={dark}
                    />
                    <SidebarItem
                        icon={Newspaper}
                        label="Noticias"
                        active={activeTab === 'Noticias'}
                        onClick={() => navigate('/news')}
                        dark={dark}
                    />
                    {/* ///////Ocualtat/////// */}
                    <SidebarItem
                        icon={User}
                        label="Perfil"
                        active={activeTab === 'Perfil'}
                        onClick={() => navigate('/profile')}
                        dark={dark}
                    />
                </nav>
            </div>

            {/* Footer Sidebar */}
            <div className="p-6" style={{ borderTop: `1px solid ${border}` }}>
                <div className="flex flex-col items-center mb-4">
                    {/* Avatar flotando sobre el card */}
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden flex-shrink-0 relative z-10 mb-[-40px]"
                        style={{ background: C.green, border: `3px solid ${C.green}`, boxShadow: `0 0 0 3px ${bg}` }}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            (user?.preferredName || user?.firstName || 'U')[0].toUpperCase()
                        )}
                    </div>
                    <div className="w-full pt-12 pb-3 px-3 rounded-xl text-center" style={{ background: userBg, border: `1px solid ${border}` }}>
                        <p className="text-sm font-bold truncate" style={{ color: text }}>
                            {user?.preferredName || user?.firstName || 'Usuario'}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider font-medium mt-0.5" style={{ color: muted }}>
                            {user?.membership?.replace('_', ' ') || 'Free'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-bold uppercase tracking-widest"
                    style={{ color: muted }}
                >
                    <LogOut size={16} />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
