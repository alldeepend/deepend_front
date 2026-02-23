
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
            alert(err.message === "Unexpected token '<', \"<html>...\" is not valid JSON"
                ? "Error de conexión o archivo demasiado grande. Por favor intenta de nuevo."
                : err.message);
        }
    });

    // Helper for client-side image compression
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
                        if (width > maxWidth) {
                            height = Math.round((height *= maxWidth / width));
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width *= maxHeight / height));
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve(file); // Fallback to original
                        return;
                    }
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                resolve(file); // Fallback to original
                                return;
                            }
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validar tamaño máximo (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`La imagen que intentas subir pesa ${(file.size / (1024 * 1024)).toFixed(2)}MB. El tamaño máximo permitido es 10MB. Por favor elige una imagen más ligera o comprímela.`);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            // Compress the image before setting it
            try {
                // Show a temporary preview or loading state if needed, but this is usually fast enough
                const compressedFile = await compressImage(file, 1200, 1200, 0.8);
                setSelectedFile(compressedFile);

                // Use the compressed file for the preview to accurately reflect what will be uploaded
                const url = URL.createObjectURL(compressedFile);
                setPreviewUrl(url);
            } catch (error) {
                console.error("Error compressing image:", error);
                // Fallback to original file
                setSelectedFile(file);
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activity || !duration) {
            alert("Por favor completa la actividad y la duración.");
            return;
        }

        const formData = new FormData();
        formData.append('activity', activity);
        formData.append('duration', duration);
        if (selectedFile) {
            formData.append('evidence', selectedFile);
        }

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
                        <label className="block text-sm font-bold text-slate-700 mb-2">Evidencia (Foto - Opcional)</label>
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
                                    <p className="text-sm font-medium">Click para subir foto (Opcional)</p>
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
