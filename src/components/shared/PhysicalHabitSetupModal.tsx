
import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Calendar, Clock, Target, Timer } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { C } from '../../styles/colors';

interface PhysicalHabitSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

export default function PhysicalHabitSetupModal({ isOpen, onClose, initialData }: PhysicalHabitSetupModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        startingPoint: '',
        weeklyMinutes: 0,
        weeklyDays: '',
        preferredTimeSlot: '',
        preferredDays: [] as string[]
    });

    const queryClient = useQueryClient();
    const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

    React.useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                startingPoint: initialData.startingPoint || '',
                weeklyMinutes: initialData.weeklyMinutes || 0,
                weeklyDays: initialData.weeklyDays || '',
                preferredTimeSlot: initialData.preferredTimeSlot || '',
                preferredDays: initialData.preferredDays || []
            });
        }
    }, [initialData, isOpen]);

    const saveMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/physical-activity-habit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Error al guardar datos');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['physical-habit'] });
            onClose();
            // Reset form for next time
            setStep(1);
            setFormData({
                startingPoint: '',
                weeklyMinutes: 0,
                weeklyDays: '',
                preferredTimeSlot: '',
                preferredDays: []
            });
            // We could show a custom success toast instead of alert
        }
    });

    if (!isOpen) return null;

    const startingPoints = [
        { id: 'A', label: 'Aún no tengo el hábito; me cuesta mucho ser consistente.', icon: '📌' },
        { id: 'B', label: 'Soy inconstante (máx. 2 veces/semana); a veces menos.', icon: '📌' },
        { id: 'C', label: 'Estoy retomando por una situación personal, pero sé cómo hacerlo.', icon: '📌' },
        { id: 'D', label: 'Entreno 3 veces/semana para mantenerme activ@.', icon: '📌' },
        { id: 'E', label: 'Estoy en nivel avanzado; el deporte/actividad física hace parte de mi vida.', icon: '📌' },
    ];

    const weeklyDaysOptions = [
        'Menos de 3 días',
        '3 días',
        '5-6 días',
        'Todos los días',
        'No hago ninguna actividad física'
    ];

    const timeSlots = [
        { label: '🌅 Muy temprano (4:00 a.m. – 7:00 a.m.)', value: 'Muy temprano' },
        { label: '🌞 En la mañana (7:00 a.m. – 11:00 a.m.)', value: 'En la mañana' },
        { label: '🌇 Tarde (2:00 p.m. – 6:00 p.m.)', value: 'Tarde' },
        { label: '🌙 Noche (6:00 p.m. – 9:00 p.m.)', value: 'Noche' },
        { label: '🌘 Muy tarde (después de 9:00 p.m.)', value: 'Muy tarde' },
        { label: '🔁 Depende del día / aún no tengo un horario fijo', value: 'Depende del día' },
    ];

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const handleDayToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            preferredDays: prev.preferredDays.includes(day)
                ? prev.preferredDays.filter(d => d !== day)
                : [...prev.preferredDays, day]
        }));
    };

    const isStepValid = () => {
        if (step === 1) return formData.startingPoint !== '';
        if (step === 2) return formData.weeklyDays !== ''; // Minutes can be 0 
        if (step === 3) return formData.preferredTimeSlot !== '' && formData.preferredDays.length > 0;
        return false;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: '#000000b3' }}>
            <div className="rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]" style={{ background: C.surface1 }}>
                {/* Header */}
                <div className="relative p-8 pb-4 flex justify-between items-start shrink-0">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: C.forest, color: C.green }}>Configuración de Reto</span>
                            <div className="flex gap-1.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-1 w-6 rounded-full transition-all duration-500" style={{ background: i <= step ? C.green : C.surface3 }} />
                                ))}
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold leading-tight" style={{ color: C.text }}>
                            {step === 1 && "¿Cuál es tu punto de partida?"}
                            {step === 2 && "¿Cómo es tu actividad física?"}
                            {step === 3 && "¿Cómo quieres organizarte?"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ background: 'transparent' }}>
                        <X size={24} style={{ color: C.label }} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pb-4 overflow-y-auto flex-1 custom-scrollbar">
                    {step === 1 && (
                        <div className="space-y-3 py-2">
                            {startingPoints.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setFormData({ ...formData, startingPoint: option.id });
                                        setStep(2);
                                    }}
                                    className="w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4"
                                    style={formData.startingPoint === option.id
                                        ? { borderColor: C.green, background: `${C.green}18` }
                                        : { borderColor: C.border, background: C.surface2 }}
                                >
                                    <span className="text-xl shrink-0 mt-0.5">{option.icon}</span>
                                    <span className="text-sm font-semibold leading-relaxed" style={{ color: formData.startingPoint === option.id ? C.text : C.textMuted }}>
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 py-4">
                            <div className="p-8 rounded-[2rem] border" style={{ background: C.surface2, borderColor: C.border }}>
                                <label className="block text-sm font-bold mb-6 text-center uppercase tracking-wider" style={{ color: C.textSec }}>
                                    ¿Cuántos minutos de actividad física a la SEMANA haces?
                                </label>
                                <div className="flex items-center justify-center gap-8">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, weeklyMinutes: Math.max(0, prev.weeklyMinutes - 15) }))}
                                        className="w-14 h-14 rounded-2xl shadow-sm border flex items-center justify-center text-3xl active:scale-95 transition-all"
                                        style={{ background: C.surface1, borderColor: C.border, color: C.label }}
                                    >−</button>
                                    <div className="text-center min-w-[120px]">
                                        <span className="text-6xl font-black tabular-nums" style={{ color: C.green }}>{formData.weeklyMinutes}</span>
                                        <span className="block text-xs font-bold uppercase mt-2" style={{ color: C.label }}>Minutos</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, weeklyMinutes: prev.weeklyMinutes + 15 }))}
                                        className="w-14 h-14 rounded-2xl shadow-sm border flex items-center justify-center text-3xl active:scale-95 transition-all"
                                        style={{ background: C.surface1, borderColor: C.border, color: C.label }}
                                    >+</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-4 flex items-center gap-2 px-2" style={{ color: C.textSec }}>
                                    <Calendar size={18} style={{ color: C.green }} />
                                    ¿Cuántos días a la semana realizas actividad física?
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {weeklyDaysOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, weeklyDays: opt })}
                                            className="p-4 rounded-xl border-2 text-sm font-bold transition-all"
                                            style={formData.weeklyDays === opt
                                                ? { borderColor: C.green, background: `${C.green}18`, color: C.text }
                                                : { borderColor: C.border, background: C.surface2, color: C.textMuted }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 py-4">
                            <div>
                                <label className="block text-sm font-bold mb-4 flex items-center gap-2 px-2" style={{ color: C.textSec }}>
                                    <Clock size={18} style={{ color: C.green }} />
                                    ¿En qué franja horaria eres más consistente?
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, preferredTimeSlot: slot.value })}
                                            className="w-full text-left p-4 rounded-xl border-2 text-sm font-bold transition-all"
                                            style={formData.preferredTimeSlot === slot.value
                                                ? { borderColor: C.green, background: `${C.green}18`, color: C.text }
                                                : { borderColor: C.border, background: C.surface2, color: C.textMuted }}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-4 flex items-center gap-2 px-2" style={{ color: C.textSec }}>
                                    <Target size={18} style={{ color: C.green }} />
                                    ¿Qué días realizas o te gustaría realizar actividad?
                                </label>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {daysOfWeek.map((day) => {
                                        const isSelected = formData.preferredDays.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => handleDayToggle(day)}
                                                className="py-3 rounded-xl border-2 text-[10px] sm:text-xs font-black transition-all uppercase tracking-tighter sm:tracking-normal"
                                            style={isSelected
                                                ? { borderColor: C.green, background: C.green, color: '#FFFFFF', transform: 'scale(1.05)' }
                                                : { borderColor: C.border, background: C.surface2, color: C.label }}
                                            >
                                                {day.substring(0, 3)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t flex justify-between items-center shrink-0" style={{ borderColor: C.border, background: C.surface1 }}>
                    <button
                        type="button"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="font-bold transition-colors px-4 py-2" style={{ color: C.label }}
                    >
                        {step === 1 ? 'Cancelar' : 'Anterior'}
                    </button>

                    <div className="flex gap-4">
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step + 1)}
                                disabled={!isStepValid()}
                                className="text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
                                style={{ background: C.green }}
                            >
                                Siguiente paso
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => saveMutation.mutate(formData)}
                                disabled={!isStepValid() || saveMutation.isPending}
                                className="text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3 disabled:opacity-50"
                                style={{ background: C.green }}
                            >
                                {saveMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                Finalizar Reto
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
