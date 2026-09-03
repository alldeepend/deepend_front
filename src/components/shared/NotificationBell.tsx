import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Bell } from 'lucide-react';
import { C } from '../../styles/colors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const POLL_INTERVAL_MS = 60000;
const PANEL_WIDTH = 320;
const VIEWPORT_MARGIN = 8;

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    link: string | null;
    createdAt: string;
    isRead: boolean;
}

interface NotificationBellProps {
    // 'circle': botón redondo con fondo, para headers/sidebar de escritorio.
    // 'plain': solo el ícono, para la barra móvil.
    variant?: 'circle' | 'plain';
}

function timeAgo(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    return `hace ${Math.floor(hrs / 24)} d`;
}

function NotificationRow({ n }: { n: NotificationItem }) {
    return (
        <div className="flex items-start gap-2">
            {!n.isRead && (
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: C.red }} />
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: C.text }}>{n.title}</p>
                <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{n.body}</p>
                <p className="text-[10px] mt-1" style={{ color: C.label }}>{timeAgo(n.createdAt)}</p>
            </div>
        </div>
    );
}

export default function NotificationBell({ variant = 'circle' }: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    async function fetchNotifications() {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/v2/notifications`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return;
            const data = await res.json();
            setItems(data.notifications ?? []);
            setUnreadCount(data.unreadCount ?? 0);
        } catch {
            // ignorado — un refresh fallido no debe romper la UI
        } finally {
            setLoaded(true);
        }
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    // El panel vive en un portal, fuera del <button> — hay que revisar los
    // dos refs por separado en vez de un solo ref padre.
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (buttonRef.current?.contains(target)) return;
            if (panelRef.current?.contains(target)) return;
            setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Posición calculada a mano (en vez de solo `absolute`) para que el panel
    // no se salga de la pantalla en el sidebar angosto, y para no depender de
    // `position: fixed` dentro del `transform` de HomePage (ver PaywallModal).
    function handleToggle() {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const left = Math.min(
                Math.max(VIEWPORT_MARGIN, rect.right - PANEL_WIDTH),
                window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN
            );
            setPanelPos({ top: rect.bottom + 8, left });
        }
        setOpen(o => !o);
    }

    function markRead(id: string) {
        setItems(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
        setUnreadCount(c => Math.max(0, c - 1));
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/v2/notifications/${id}/read`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
    }

    function markAllRead() {
        setItems(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/v2/notifications/read-all`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
    }

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                aria-label="Notificaciones"
                title="Notificaciones"
                className={
                    variant === 'circle'
                        ? 'relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105'
                        : 'relative'
                }
                style={
                    variant === 'circle'
                        ? { background: C.surface1, border: `1px solid ${C.border}`, color: C.text }
                        : { color: C.text }
                }
            >
                <Bell size={variant === 'circle' ? 16 : 22} />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold leading-none"
                        style={{ background: C.red, color: '#fff' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && panelPos && createPortal(
                <div
                    ref={panelRef}
                    className="fixed rounded-xl shadow-2xl z-[200] overflow-hidden"
                    style={{ top: panelPos.top, left: panelPos.left, width: PANEL_WIDTH, background: C.surface1, border: `1px solid ${C.border}` }}
                >
                    <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                        <span className="text-sm font-bold" style={{ color: C.text }}>Notificaciones</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: C.red }}>
                                Marcar todas
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {!loaded ? (
                            <p className="text-sm text-center py-8" style={{ color: C.textMuted }}>Cargando...</p>
                        ) : items.length === 0 ? (
                            <p className="text-sm text-center py-8" style={{ color: C.textMuted }}>
                                No tienes notificaciones
                            </p>
                        ) : (
                            items.map(n => {
                                const handleClick = () => {
                                    if (!n.isRead) markRead(n.id);
                                    setOpen(false);
                                };
                                const rowStyle = {
                                    background: n.isRead ? 'transparent' : `${C.red}0d`,
                                    borderBottom: `1px solid ${C.border}`,
                                };
                                return n.link ? (
                                    <Link key={n.id} to={n.link} onClick={handleClick} className="block px-4 py-3" style={rowStyle}>
                                        <NotificationRow n={n} />
                                    </Link>
                                ) : (
                                    <div key={n.id} onClick={handleClick} className="px-4 py-3 cursor-pointer" style={rowStyle}>
                                        <NotificationRow n={n} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
