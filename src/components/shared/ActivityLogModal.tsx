import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Clock, Activity, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AlertModal from './AlertModal';
import PaywallModal from '../subscription/PaywallModal';
import { ACTIVITY_METRIC_TYPES } from '../../utils/activityMetrics';

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
    const MAX_PHOTOS = 5;
    const [activity, setActivity] = useState('');
    const [duration, setDuration] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [activeMetrics, setActiveMetrics] = useState<Record<string, boolean>>({});
    const [metricValues, setMetricValues] = useState<Record<string, string>>({});
    const [metricUnits, setMetricUnits] = useState<Record<string, string>>(() =>
        Object.fromEntries(ACTIVITY_METRIC_TYPES.map(t => [t.id, t.unitOptions[0].value]))
    );
    const [checkinResponse, setCheckinResponse] = useState('');
    const [formError, setFormError] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [showPaywall, setShowPaywall] = useState(false);
    const [showLastFreeMessage, setShowLastFreeMessage] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

    const { data: limitStatus } = useQuery({
        queryKey: ['activity-log-limit-status'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/activity-log/limit-status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return await res.json() as { paid: boolean; used: number; limit: number };
        },
        enabled: isOpen,
    });
    const isLocked = !!limitStatus && !limitStatus.paid && limitStatus.used >= limitStatus.limit;

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

    const { data: weeklyChallengeData } = useQuery({
        queryKey: ['weekly-challenge-me'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/v2/weekly-challenge/me`, {
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
        setSelectedFiles([]);
        setPreviewUrls([]);
        setActiveMetrics({});
        setMetricValues({});
        setCheckinResponse('');
        setFormError('');
        setUploadError('');
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

    const weeklyChallengeCheckinMutation = useMutation({
        mutationFn: async (response: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/v2/weekly-challenge/checkin`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ response })
            });
            if (!res.ok) throw new Error('Error al guardar check-in');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['weekly-challenge-me'] });
        }
    });

    const logMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const token = localStorage.getItem('token');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            let res: Response;
            try {
                res = await fetch(`${host}/api/activity-log`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                    signal: controller.signal
                });
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    throw new Error('La subida está tardando demasiado. Revisa tu conexión e intenta de nuevo.');
                }
                throw new Error('No se pudo conectar. Revisa tu conexión e intenta de nuevo.');
            } finally {
                clearTimeout(timeoutId);
            }

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw Object.assign(new Error(error.error || 'Error al guardar actividad'), { code: error.code });
            }
            return await res.json();
        },
        onSuccess: async (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
            queryClient.invalidateQueries({ queryKey: ['all-activities'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-progress'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-challenge-progress'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-challenge-podium'] });
            queryClient.invalidateQueries({ queryKey: ['activity-log-limit-status'] });

            // Save check-in if provided (reto viejo "Desde Aquí" y/o Reto Semanal, el que aplique)
            if (checkinResponse && challengeData?.isParticipant && (!challengeData?.hasCheckedInThisWeek || !challengeData?.checkinResponse)) {
                try { await checkinMutation.mutateAsync(checkinResponse); } catch {}
            }
            if (checkinResponse && weeklyChallengeData?.isParticipant && !weeklyChallengeData?.hasCheckedInThisWeek) {
                try { await weeklyChallengeCheckinMutation.mutateAsync(checkinResponse); } catch {}
            }

            resetForm();
            if (data?.isLastFreeAction) {
                setShowLastFreeMessage(true);
            } else {
                onClose();
                alert('Actividad registrada con éxito!');
            }
        },
        onError: (err: any) => {
            if (err.code === 'PAYWALL') {
                queryClient.invalidateQueries({ queryKey: ['activity-log-limit-status'] });
                return;
            }
            setUploadError(err.message === "Unexpected token '<', \"<html>...\" is not valid JSON"
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
        const files = Array.from(e.target.files ?? []);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (files.length === 0) return;

        const room = MAX_PHOTOS - selectedFiles.length;
        if (room <= 0) return;
        const toAdd = files.slice(0, room);

        const oversized = toAdd.find(f => f.size > 10 * 1024 * 1024);
        if (oversized) {
            alert(`La imagen pesa ${(oversized.size / (1024 * 1024)).toFixed(2)}MB. Máximo 10MB.`);
            return;
        }

        const compressedFiles = await Promise.all(toAdd.map(async file => {
            try {
                return await compressImage(file, 1200, 1200, 0.8);
            } catch {
                return file;
            }
        }));

        setSelectedFiles(prev => [...prev, ...compressedFiles]);
        setPreviewUrls(prev => [...prev, ...compressedFiles.map(f => URL.createObjectURL(f))]);
    };

    const removePhoto = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setUploadError('');
        if (!activity || !duration) {
            setFormError('Por favor completa la actividad y la duración.');
            return;
        }
        if (showCheckin && !checkinResponse) {
            setFormError('Por favor indica cómo va tu semana.');
            return;
        }
        const metrics = ACTIVITY_METRIC_TYPES
            .filter(t => activeMetrics[t.id] && metricValues[t.id]?.trim())
            .map(t => ({ type: t.id, value: metricValues[t.id].trim(), unit: metricUnits[t.id] }));

        const formData = new FormData();
        formData.append('activity', activity);
        formData.append('duration', duration);
        selectedFiles.forEach(file => formData.append('evidence', file));
        if (metrics.length > 0) formData.append('metrics', JSON.stringify(metrics));
        logMutation.mutate(formData);
    };

    const showCheckin =
        (challengeData?.isParticipant && challengeData?.isInChallenge &&
            (!challengeData?.hasCheckedInThisWeek || !challengeData?.checkinResponse)) ||
        (weeklyChallengeData?.isParticipant && !weeklyChallengeData?.hasCheckedInThisWeek);

    if (!isOpen) return null;

    return createPortal(
        <>
            {/* Main modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: '#000000b3', backdropFilter: 'blur(4px)' }}>
                <div className="rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[85dvh] animate-fade-in-up border" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
                    <div className="flex justify-between items-center p-4 border-b shrink-0" style={{ borderColor: '#333330' }}>
                        <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                            <Activity style={{ color: '#52B788' }} size={20} />
                            Registrar Actividad Fisica
                        </h3>
                        <button onClick={onClose} className="transition-colors" style={{ color: '#A8A29E' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {showLastFreeMessage ? (
                        <div className="p-6 flex flex-col items-center text-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ background: '#52B78826', color: '#52B788' }}
                            >
                                <CheckCircle2 size={22} />
                            </div>
                            <h4 className="font-bold text-base" style={{ color: '#F5F0E8' }}>
                                ¡Completaste tus 3 actividades físicas gratis!
                            </h4>
                            <p className="text-sm" style={{ color: '#A8A29E' }}>
                                Con Premium sigues registrando tu movimiento sin límites.
                            </p>
                            <button
                                onClick={() => setShowPaywall(true)}
                                className="w-full mt-2 py-3 rounded-xl font-bold text-sm"
                                style={{ background: 'linear-gradient(135deg, #EF9F27, #d97e0a)', color: '#201400' }}
                            >
                                Ver Premium
                            </button>
                            <button
                                onClick={() => { setShowLastFreeMessage(false); onClose(); }}
                                className="w-full py-2.5 rounded-xl font-semibold text-sm"
                                style={{ color: '#A8A29E' }}
                            >
                                Entendido
                            </button>
                        </div>
                    ) : isLocked ? (
                        <div className="p-6 flex flex-col items-center text-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ background: '#EF9F2726', color: '#EF9F27' }}
                            >
                                <Lock size={22} />
                            </div>
                            <h4 className="font-bold text-base" style={{ color: '#F5F0E8' }}>
                                Ya registraste tus primeras actividades
                            </h4>
                            <p className="text-sm" style={{ color: '#A8A29E' }}>
                                Con Premium sigues registrando tu movimiento sin límites.
                            </p>
                            <button
                                onClick={() => setShowPaywall(true)}
                                className="w-full mt-2 py-3 rounded-xl font-bold text-sm"
                                style={{ background: 'linear-gradient(135deg, #EF9F27, #d97e0a)', color: '#201400' }}
                            >
                                Ver Premium
                            </button>
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                        {/* Check-in semanal — participantes que aún no han respondido esta semana */}
                        {showCheckin && (
                            <div className="rounded-xl p-4 border" style={{ background: '#252020', borderColor: formError && !checkinResponse ? '#EE2A28' : '#333330' }}>
                                <p className="text-sm font-bold mb-3" style={{ color: '#F5F0E8' }}>¿Cómo va tu semana? <span style={{ color: '#EE2A28' }}>*</span></p>
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
                            <label className="block text-sm font-bold mb-2" style={{ color: '#F5F0E8' }}>Actividad Realizada <span style={{ color: '#EE2A28' }}>*</span></label>
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
                                <Clock size={16} style={{ color: '#A8A29E' }} /> Tiempo / Duración (minutos) <span style={{ color: '#EE2A28' }}>*</span>
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

                        <div className="space-y-2.5">
                            <div>
                                <label className="text-sm font-bold" style={{ color: '#F5F0E8' }}>¿Cómo más lo registraste?</label>
                                <p className="mt-0.5" style={{ fontSize: 11, color: '#6B6460' }}>Puedes elegir varias</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {ACTIVITY_METRIC_TYPES.map(t => {
                                    const active = !!activeMetrics[t.id];
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setActiveMetrics(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                                            className="rounded-xl text-xs font-semibold text-center"
                                            style={{
                                                flex: '1 1 44%',
                                                padding: '10px 8px',
                                                background: '#252020',
                                                border: `1px solid ${active ? '#52B788' : '#EF9F27'}`,
                                                color: active ? '#52B788' : '#EF9F27',
                                            }}
                                        >
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {ACTIVITY_METRIC_TYPES.filter(t => activeMetrics[t.id]).map(t => (
                                <div key={t.id} className="flex flex-col gap-1">
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6B6460', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.label}</span>
                                    <div className="flex items-stretch gap-1.5 rounded-xl p-1.5" style={{ background: '#252020', border: '1px solid #333330' }}>
                                        <input
                                            type="text"
                                            value={metricValues[t.id] ?? ''}
                                            onChange={(e) => setMetricValues(prev => ({ ...prev, [t.id]: e.target.value }))}
                                            placeholder={t.placeholder}
                                            className="flex-1 min-w-0 outline-none"
                                            style={{ background: 'transparent', border: 'none', color: '#F5F0E8', fontSize: 14, padding: '8px 10px' }}
                                        />
                                        <select
                                            value={metricUnits[t.id]}
                                            onChange={(e) => setMetricUnits(prev => ({ ...prev, [t.id]: e.target.value }))}
                                            className="rounded-lg"
                                            style={{ border: 'none', background: '#333330', color: '#EF9F27', fontSize: 12, fontWeight: 700, padding: '0 10px' }}
                                        >
                                            {t.unitOptions.map(u => (
                                                <option key={u.value} value={u.value}>{u.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2" style={{ color: '#F5F0E8' }}>
                                Evidencia <span className="font-normal" style={{ color: '#666' }}>· {previewUrls.length}/{MAX_PHOTOS}</span>
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            {previewUrls.length === 0 ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all"
                                    style={{ borderColor: '#333330', color: '#A8A29E' }}
                                >
                                    <Upload size={32} className="mb-2" style={{ color: '#A8A29E' }} />
                                    <p className="text-sm font-medium">Click para subir evidencia</p>
                                    <p className="text-xs mt-1" style={{ color: '#666' }}>Hasta {MAX_PHOTOS} · JPG, PNG, WebP (Max 10MB c/u)</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {previewUrls.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ background: '#000000b3', color: '#fff' }}
                                                aria-label="Quitar foto"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {previewUrls.length < MAX_PHOTOS && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
                                            style={{ borderColor: '#333330', color: '#A8A29E' }}
                                        >
                                            <Upload size={18} />
                                            <span className="text-[10px] font-medium">Agregar</span>
                                        </button>
                                    )}
                                </div>
                            )}
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
                    )}
                </div>
            </div>

            <AlertModal
                isOpen={!!uploadError}
                title="No se pudo subir"
                message={uploadError}
                onConfirm={() => setUploadError('')}
            />
            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
        </>,
        document.body
    );
}
