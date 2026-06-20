
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: '#000000b3', backdropFilter: 'blur(4px)' }}>
            <div className="rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up border" style={{ background: '#1E1A1B', borderColor: '#333330' }}>
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: '#333330', background: 'linear-gradient(to right, #52B78822, transparent)' }}>
                    <h3 className="font-bold text-xl flex items-center gap-2" style={{ color: '#F5F0E8', fontFamily: "'American Typewriter', Georgia, serif" }}>
                        <Star style={{ color: '#52B788', fill: '#52B788' }} size={24} />
                        Mi Cofre de Reconocimiento
                    </h3>
                    <button onClick={onClose} className="transition-colors" style={{ color: '#A8A29E' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <p className="text-sm italic" style={{ color: '#A8A29E' }}>
                        Tómate un momento para reflexionar y reconocer lo valioso de tu día.
                    </p>

                    {/* Question 1 */}
                    <div className="space-y-3">
                        <label className="block font-bold text-lg leading-tight" style={{ color: '#F5F0E8' }}>
                            ¿Qué de tu vida hoy merece ser reconocido?
                        </label>
                        <textarea
                            value={question1}
                            onChange={(e) => setQuestion1(e.target.value)}
                            placeholder="Escribe aquí tu respuesta..."
                            className="w-full px-4 py-3 rounded-xl border outline-none transition-all min-h-[100px] resize-none focus:ring-2"
                            style={{ background: '#252020', borderColor: '#333330', color: '#F5F0E8', ['--tw-ring-color' as any]: '#52B788' }}
                        />
                    </div>

                    {/* Question 2 */}
                    <div className="space-y-3">
                        <label className="block font-bold text-lg leading-tight" style={{ color: '#F5F0E8' }}>
                            ¿Qué sucedió, te dijeron o solo te recordó hoy que tu vida tiene valor?
                        </label>
                        <textarea
                            value={question2}
                            onChange={(e) => setQuestion2(e.target.value)}
                            placeholder="Escribe aquí tu respuesta..."
                            className="w-full px-4 py-3 rounded-xl border outline-none transition-all min-h-[100px] resize-none focus:ring-2"
                            style={{ background: '#252020', borderColor: '#333330', color: '#F5F0E8', ['--tw-ring-color' as any]: '#52B788' }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={recognitionMutation.isPending}
                        className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                        style={{ background: '#52B788' }}
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
