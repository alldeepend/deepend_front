import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Clock, Activity, Loader2, CheckCircle2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ActivityLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CHECKIN_OPTIONS = [
    { value: 'EN_RITMO',        emoji: '🟢', label: 'Voy en ritmo' },
    { value: 'LENTO_PERO_VOY',  emoji: '🟡', label: 'Voy lento, pero voy' },
    { value: 'NECESITO_VOLVER', emoji: '🔁', label: 'Necesito volver' },
    { value: 'EN_PAUSA',        emoji: '⚪', label: 'Esta semana estoy en pausa' },
];

export default function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
    const [activity, setActivity] = useState('');
    const [duration, setDuration] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [checkinResponse, setCheckinResponse] = useState('');
    const [formError, setFormError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

    const { data: challengeData } = useQuery({
        queryKey: ['challenge-me'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenge/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return await res.json();
        },
        enabled: isOpen,
    });

    const resetForm = () => {
        setActivity('');
        setDuration('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setCheckinResponse('');
        setFormError('');
    };

    const checkinMutation = useMutation({
        mutationFn: async (response: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/challenge/checkin`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ response })
            });
            if (!res.ok) throw new Error('Error al guardar check-in');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-me'] });
        }
    });

    const logMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/activity-log`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error al guardar actividad');
            }
            return await res.json();
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
            queryClient.invalidateQueries({ queryKey: ['all-activities'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-progress'] });

            // Save check-in if provided
            if (checkinResponse && challengeData?.isParticipant && (!challengeData?.hasCheckedInThisWeek || !challengeData?.checkinResponse)) {
                try { await checkinMutation.mutateAsync(checkinResponse); } catch {}
            }

            onClose();
            resetForm();
            alert('Actividad registrada con éxito!');
        },
        onError: (err: any) => {
            alert(err.message === "Unexpected token '<', \"<html>...\" is not valid JSON"
                ? 'Error de conexión o archivo demasiado grande. Por favor intenta de nuevo.'
                : err.message);
        }
    });

    const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxWidth) { height = Math.round((height *= maxWidth / width)); width = maxWidth; }
                    } else {
                        if (height > maxHeight) { width = Math.round((width *= maxHeight / height)); height = maxHeight; }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { resolve(file); return; }
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (!blob) { resolve(file); return; }
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', quality);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert(`La imagen pesa ${(file.size / (1024 * 1024)).toFixed(2)}MB. Máximo 10MB.`);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            try {
                const compressed = await compressImage(file, 1200, 1200, 0.8);
                setSelectedFile(compressed);
                setPreviewUrl(URL.createObjectURL(compressed));
            } catch {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!activity || !duration) {
            setFormError('Por favor completa la actividad y la duración.');
            return;
        }
        if (showCheckin && !checkinResponse) {
            setFormError('Por favor indica cómo va tu semana.');
            return;
        }
        const formData = new FormData();
        formData.append('activity', activity);
        formData.append('duration', duration);
        if (selectedFile) formData.append('evidence', selectedFile);
        logMutation.mutate(formData);
    };

    const showCheckin = challengeData?.isParticipant && challengeData?.isInChallenge &&
        (!challengeData?.hasCheckedInThisWeek || !challengeData?.checkinResponse);

    if (!isOpen) return null;

    return (
        <>
            {/* Main modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: '#000000b3', backdropFilter: 'blur(4px)' }}>
                <div className="rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] [max-height:85svh] animate-fade-in-up border" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
                    <div className="flex justify-between items-center p-4 border-b shrink-0" style={{ borderColor: '#333330' }}>
                        <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                            <Activity style={{ color: '#52B788' }} size={20} />
                            Registrar Actividad Fisica
                        </h3>
                        <button onClick={onClose} className="transition-colors" style={{ color: '#A8A29E' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                        {/* Check-in semanal — participantes que aún no han respondido esta semana */}
                        {showCheckin && (
                            <div className="rounded-xl p-4 border" style={{ background: '#252020', borderColor: formError && !checkinResponse ? '#EE2A28' : '#333330' }}>
                                <p className="text-sm font-bold mb-3" style={{ color: '#F5F0E8' }}>¿Cómo va tu semana?</p>
                                <div className="space-y-2">
                                    {CHECKIN_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setCheckinResponse(opt.value)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all"
                                            style={checkinResponse === opt.value
                                                ? { borderColor: '#52B788', background: '#52B78822', color: '#52B788' }
                                                : { borderColor: '#333330', background: '#1E1A1B', color: '#F5F0E8' }}
                                        >
                                            <span>{opt.emoji}</span>
                                            <span>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formError && !checkinResponse && (
                            <p className="text-sm -mt-4 mb-2" style={{ color: '#EE2A28' }}>Por favor indica cómo va tu semana.</p>
                        )}

                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: '#F5F0E8' }}>Actividad Realizada</label>
                            <input
                                type="text"
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                placeholder="Ej: Correr, Yoga"
                                className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2"
                                style={{ background: '#252020', borderColor: '#333330', color: '#F5F0E8', ['--tw-ring-color' as any]: '#52B788' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#F5F0E8' }}>
                                <Clock size={16} style={{ color: '#A8A29E' }} /> Tiempo / Duración (minutos)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Ej: 30"
                                className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2"
                                style={{ background: '#252020', borderColor: '#333330', color: '#F5F0E8', ['--tw-ring-color' as any]: '#52B788' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: '#F5F0E8' }}>Evidencia (Foto - Opcional)</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all"
                                style={{ borderColor: '#333330', color: '#A8A29E' }}
                            >
                                {previewUrl ? (
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white font-medium">Cambiar foto</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={32} className="mb-2" style={{ color: '#A8A29E' }} />
                                        <p className="text-sm font-medium">Click para subir foto (Opcional)</p>
                                        <p className="text-xs mt-1" style={{ color: '#666' }}>JPG, PNG, WebP (Max 10MB)</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={logMutation.isPending}
                            className="w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ background: '#52B788' }}
                        >
                            {logMutation.isPending ? (
                                <><Loader2 size={20} className="animate-spin" /> Subiendo...</>
                            ) : (
                                <><CheckCircle2 size={20} /> Guardar Registro</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
