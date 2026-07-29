import { useNavigate } from 'react-router';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { HomeSidebar } from '../home/HomeSidebar';
import Header from '../shared/Header';
import { useAuth } from '../../store/useAuth';
import { C } from '../../styles/colors';

const WEEKS = [
    'La chispa', 'El compromiso', 'El obstáculo', 'La pausa',
    'El empuje', 'La constancia', 'El cierre', 'La mirada atrás',
];


export default function RetoSemanal() {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (user?.role !== 'admin') {
        navigate('/dashboard', { replace: true });
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header dark />
            </div>

            <HomeSidebar activeTab="Reto Semanal" dark />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-6 md:p-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-sm mb-6 transition-colors group"
                        style={{ color: C.label }}
                    >
                        <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>

              

                    <div className="relative rounded-3xl overflow-hidden mb-8" style={{ border: `1px solid ${C.border}` }}>
                        <img
                            src="/Reto Desde Aquí.png"
                            alt=""
                            className="w-full h-64 sm:h-80 object-cover"
                        />
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                            style={{ background: C.bg + '77' }}
                        >
                            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: C.red }}>
                                Próximamente · Para toda la comunidad
                            </p>
                            <h1
                                className="text-3xl sm:text-4xl font-bold max-w-lg leading-tight"
                                style={{ fontFamily: "'American Typewriter', Georgia, serif", color: C.text }}
                            >
                                Reto Semanal: 8 semanas, un paso a la vez
                            </h1>
                        </div>
                    </div>

                    <div
                        className="rounded-2xl border p-6 mb-8"
                        style={{ background: C.surface1, borderColor: C.border }}
                    >
                        <p className="text-sm leading-relaxed" style={{ color: C.textSec }}>
                            Un solo reto de 8 semanas, abierto a todos los usuarios — no depende de tener acceso a
                            Mundos y Viajes. Queda separado de <span style={{ color: C.text, fontWeight: 600 }}>Retos Antiguos</span>,
                            que sigue existiendo tal cual está hoy como recuerdo del progreso pasado.
                        </p>
                        <p className="text-sm leading-relaxed mt-3" style={{ color: C.textSec }}>
                            Esto es apenas una vista temprana para ir revisando el diseño y el tono — todavía no
                            tiene contenido real ni guarda progreso de nadie.
                        </p>
                    </div>

                    <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: C.label }}>
                        Las 8 semanas
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {WEEKS.map((title, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border p-4 flex flex-col gap-3"
                                style={{ background: C.surface1, borderColor: C.border }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ background: C.surface2, color: C.label }}
                                >
                                    <Lock size={13} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: C.label }}>
                                        Semana {i + 1}
                                    </p>
                                    <p className="text-sm font-semibold mt-0.5" style={{ color: C.textMuted }}>
                                        {title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
