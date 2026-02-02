
import React, { useState, useRef } from 'react';
import { X, Upload, Clock, Activity, Loader2, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ActivityLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
    const [activity, setActivity] = useState('');
    const [duration, setDuration] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

    const logMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/activity-log`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error al guardar actividad');
            }
            return await res.json();
        },
        onSuccess: () => {
            // Invalidate/refetch queries
            queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
            queryClient.invalidateQueries({ queryKey: ['all-activities'] });

            onClose();
            // Reset form
            setActivity('');
            setDuration('');
            setSelectedFile(null);
            setPreviewUrl(null);
            alert("Actividad registrada con éxito!");
        },
        onError: (err: any) => {
            alert(err.message);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activity || !duration || !selectedFile) {
            alert("Por favor completa todos los campos y sube una foto.");
            return;
        }

        const formData = new FormData();
        formData.append('activity', activity);
        formData.append('duration', duration);
        formData.append('evidence', selectedFile);

        logMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Activity className="text-emerald-500" size={20} />
                        Registrar Actividad
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Activity Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Actividad Realizada</label>
                        <input
                            type="text"
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            placeholder="Ej: Correr, Yoga, Lectura..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                    </div>

                    {/* Duration Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" /> Tiempo / Duración (minutos)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Ej: 30"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                    </div>

                    {/* Evidence Upload */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Evidencia (Foto)</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
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
                                    <Upload size={32} className="mb-2 text-slate-400" />
                                    <p className="text-sm font-medium">Click para subir foto</p>
                                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP (Max 10MB)</p>
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={logMutation.isPending}
                        className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {logMutation.isPending ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Subiendo...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={20} /> Guardar Registro
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
