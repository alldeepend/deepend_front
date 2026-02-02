import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../store/useAuth';
import { LogOut, Bell, Check, X, Loader2, Menu, LayoutDashboard, Compass, Flag, BookOpen, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, setUser } = useAuth();

  const isDiary = location.pathname.includes('/diary');

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);

  // Mobile Menu State
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  /* const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }; */

  /* useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []); */

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isInsideDesktop = notificationRef.current && notificationRef.current.contains(event.target as Node);
      const isInsideMobile = mobileNotificationRef.current && mobileNotificationRef.current.contains(event.target as Node);

      if (!isInsideDesktop && !isInsideMobile) {
        setShowNotifications(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRespond = async (id: number, status: 'ACCEPTED' | 'REJECTED') => {
    if (processingId) return; // Prevent double clicking
    setProcessingId(id);
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      setNotifications(prev => prev.filter(n => n.id !== id));

      if (status === 'ACCEPTED') {
        const data = await response.json();
        if (data.new) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.categories = data.categories;
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          navigate(`/memory/${data.slug}/activity/${data.activityId}`);
        }
      }
    } catch (error) {
      console.error('Error responding:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <header className="items-center py-4 w-full mx-auto px-6 lg:px-10">
      <nav>
        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-10 justify-between">
          <li>
            <Link to="/dashboard" className="text-stone-800 hover:text-accent-green transition-colors font-handwriting text-3xl">
              <img src="https://media.1000momentos.com/memories/69e82978-65ec-4ca5-9397-468483861205-DeepEnd_FondoBlanco.webp" alt="" />
            </Link>
          </li>
          <li>
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-stone-800 hover:text-accent-green transition-colors p-2"
              >
                <Bell size={24} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <h3 className="font-bold text-stone-800">Notificaciones</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-stone-500 text-sm">
                      No tienes notificaciones
                    </div>
                  ) : (
                    <ul className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <li key={notif.id} className="p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors">
                          <div className="flex gap-3">
                            {notif.sender?.avatar ? (
                              <img src={notif.sender.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                {notif.sender?.preferredName?.[0] || notif.sender?.name?.[0] || '?'}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-stone-700">
                                <span className="font-bold">{notif.sender?.preferredName || notif.sender?.name}</span> te invitó a ver una memoria de la actividad <span className="font-medium">"{notif.memory?.activity?.title}"</span>
                              </p>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleRespond(notif.id, 'ACCEPTED')}
                                  disabled={processingId === notif.id}
                                  className="flex-1 bg-accent-green text-white text-xs py-1.5 px-3 rounded-lg font-medium hover:bg-accent-green/90 flex items-center justify-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                  {processingId === notif.id ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin" /> Aceptando...
                                    </>
                                  ) : (
                                    <>
                                      <Check size={14} /> Aceptar
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRespond(notif.id, 'REJECTED')}
                                  className="px-3 py-1.5 border border-stone-200 text-stone-600 text-xs rounded-lg font-medium hover:bg-stone-100 flex items-center justify-center gap-1"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </li>
          <li>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-2 whitespace-nowrap w-fit p-2 text-stone-400 cursor-pointer hover:text-stone-600 transition-colors"
              title="Cerrar sesión"
            >
              Cerrar sesión <LogOut size={20} />
            </button>
          </li>
        </ul>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center justify-between">
          <Link to="/dashboard" className="text-stone-800 hover:text-accent-green transition-colors font-handwriting text-2xl">
            <img className="w-20" src="https://media.1000momentos.com/memories/69e82978-65ec-4ca5-9397-468483861205-DeepEnd_FondoBlanco.webp" alt="" />
          </Link>
          <div className="relative" ref={mobileMenuRef}>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-stone-800 hover:text-accent-green transition-colors"
              aria-label="Menú"
            >
              <Menu size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>

            {showMobileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-stone-100">
                  <h3 className="font-bold text-stone-800">Menú</h3>
                </div>
                <ul className="py-2">
                  <li>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <LayoutDashboard size={20} />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </li>

                  {/* ///////Ocualtar/////// */}

                  <li>
                    <Link
                      to="/challenges"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Flag size={20} />
                      <span className="font-medium">Mis Retos</span>
                    </Link>
                  </li>
                  {/* Secciones restringidas por rol */}
                  {(user?.role === 'admin' /* || user?.role === 'user' */) && (
                    <>
                      <li>
                        <Link
                          to="/journey"
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Compass size={20} />
                          <span className="font-medium">Mi Viaje</span>
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/resources"
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <BookOpen size={20} />
                          <span className="font-medium">Mis Recursos</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* ///////Ocualtar/////// */}


                  <li>
                    <Link
                      to="/profile"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <User size={20} />
                      <span className="font-medium">Perfil</span>
                    </Link>
                  </li>
                  <li>
                    <div className="relative px-4 py-3" ref={mobileNotificationRef}>
                      <button
                        onClick={() => {
                          setShowNotifications(!showNotifications);
                        }}
                        className="flex items-center gap-3 w-full text-left text-stone-700 hover:bg-stone-50 transition-colors rounded-lg"
                      >
                        <div className="relative">
                          <Bell size={20} />
                          {notifications.length > 0 && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                          )}
                        </div>
                        <span className="font-medium">Notificaciones</span>
                        {notifications.length > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {notifications.length}
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="mt-2 bg-white rounded-lg shadow-lg border border-stone-100 py-2 max-h-96 overflow-y-auto">
                          <div className="px-4 py-2 border-b border-stone-100">
                            <h4 className="font-bold text-stone-800 text-sm">Notificaciones</h4>
                          </div>
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-stone-500 text-xs">
                              No tienes notificaciones
                            </div>
                          ) : (
                            <ul>
                              {notifications.map(notif => (
                                <li key={notif.id} className="p-3 border-b border-stone-50 hover:bg-stone-50 transition-colors">
                                  <div className="flex gap-2">
                                    {notif.sender?.avatar ? (
                                      <img src={notif.sender.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                        {notif.sender?.preferredName?.[0] || notif.sender?.name?.[0] || '?'}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-stone-700">
                                        <span className="font-bold">{notif.sender?.preferredName || notif.sender?.name}</span> te invitó a ver una memoria de la actividad <span className="font-medium">"{notif.memory?.activity?.title}"</span>
                                      </p>
                                      <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={() => handleRespond(notif.id, 'ACCEPTED')}
                                          disabled={processingId === notif.id}
                                          className="flex-1 bg-accent-green text-white text-xs py-1 px-2 rounded-lg font-medium hover:bg-accent-green/90 flex items-center justify-center gap-1"
                                        >
                                          {processingId === notif.id ? (
                                            <>
                                              <Loader2 size={14} className="animate-spin" /> Aceptando...
                                            </>
                                          ) : (
                                            <>
                                              <Check size={14} /> Aceptar
                                            </>
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleRespond(notif.id, 'REJECTED')}
                                          className="px-2 py-1 border border-stone-200 text-stone-600 text-xs rounded-lg font-medium hover:bg-stone-100 flex items-center justify-center"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Cerrar sesión</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}