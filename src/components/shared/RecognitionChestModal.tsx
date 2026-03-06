
import React, { useState } from 'react';
import { X, Heart, Loader2, CheckCircle2, Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RecognitionChestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RecognitionChestModal({ isOpen, onClose }: RecognitionChestModalProps) {
    const [question1, setQuestion1] = useState('');
    const [question2, setQuestion2] = useState('');
    const queryClient = useQueryClient();

    const host = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');

    const recognitionMutation = useMutation({
        mutationFn: async (data: { question1: string, question2: string }) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`${host}/api/recognitions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error al guardar reconocimiento');
            }
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recognitions'] });
            onClose();
            setQuestion1('');
            setQuestion2('');
            alert("¡Reconocimiento guardado con éxito! ✨");
        },
        onError: (err: any) => {
            alert(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question1.trim() || !question2.trim()) {
            alert("Por favor responde a ambas preguntas.");
            return;
        }

        recognitionMutation.mutate({ question1, question2 });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-transparent">
                    <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                        <Star className="text-emerald-500 fill-emerald-500" size={24} />
                        Mi Cofre de Reconocimiento
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <p className="text-slate-500 text-sm italic">
                        Tómate un momento para reflexionar y reconocer lo valioso de tu día.
                    </p>

                    {/* Question 1 */}
                    <div className="space-y-3">
                        <label className="block text-slate-700 font-bold text-lg leading-tight">
                            ¿Qué de tu vida hoy merece ser reconocido?
                        </label>
                        <textarea
                            value={question1}
                            onChange={(e) => setQuestion1(e.target.value)}
                            placeholder="Escribe aquí tu respuesta..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Question 2 */}
                    <div className="space-y-3">
                        <label className="block text-slate-700 font-bold text-lg leading-tight">
                            ¿Qué sucedió, te dijeron o solo te recordó hoy que tu vida tiene valor?
                        </label>
                        <textarea
                            value={question2}
                            onChange={(e) => setQuestion2(e.target.value)}
                            placeholder="Escribe aquí tu respuesta..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={recognitionMutation.isPending}
                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                    >
                        {recognitionMutation.isPending ? (
                            <>
                                <Loader2 size={22} className="animate-spin" /> Guardando...
                            </>
                        ) : (
                            <>
                                <Heart size={22} className="fill-white" /> Guardar en mi Cofre
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
