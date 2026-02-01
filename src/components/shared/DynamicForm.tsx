import React, { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

interface Field {
    id: string;
    type: string;
    label: string;
    help_text?: string;
    options?: string[];
    condition?: {
        field: string;
        value: string | any;
    };
    validation?: {
        max_selection?: number;
    };
    min?: number;
    max?: number;
    step?: number;
    labels?: {
        min: string;
        max: string;
    };
}

interface FormSchema {
    fields: Field[];
}

interface DynamicFormProps {
    schema: FormSchema;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: any;
    isSubmitting?: boolean;
}

export default function DynamicForm({ schema, onSubmit, onCancel, initialData = {}, isSubmitting = false }: DynamicFormProps) {
    const [formData, setFormData] = useState<any>(initialData);
    const [errors, setErrors] = useState<any>({});

    const handleChange = (id: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [id]: value }));
        // Clear error if exists
        if (errors[id]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const shouldShowField = (field: Field) => {
        if (!field.condition) return true;
        const dependentValue = formData[field.condition.field];
        return dependentValue === field.condition.value;
    };

    const handleMultiSelect = (id: string, option: string, maxSelection?: number) => {
        const current = formData[id] || [];
        let updated;
        if (current.includes(option)) {
            updated = current.filter((item: string) => item !== option);
        } else {
            if (maxSelection && current.length >= maxSelection) {
                return; // Prevent adding more than max
            }
            updated = [...current, option];
        }
        handleChange(id, updated);
    };

    const validate = () => {
        const newErrors: any = {};
        let isValid = true;

        schema.fields.forEach(field => {
            // Skip validation if field is hidden
            if (!shouldShowField(field)) return;

            if (field.type !== 'header' && !formData[field.id] && formData[field.id] !== 0) { // Check for empty, allowing 0
                // Simple required check for now (only if we enforce required)
                // Assuming all questions are effectively required unless optional? 
                // schema doesn't have explicit required flag in JSON provided, but usually yes.
                // Let's hold off on strict required unless 'required: true' is passed or implied.
            }
            if (field.type === 'multiselect' && field.validation?.max_selection) {
                if (formData[field.id]?.length > field.validation.max_selection) {
                    newErrors[field.id] = `Selecciona máximo ${field.validation.max_selection} opciones`;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        } else {
            // Optional: Alert or stick validation
            alert("Por favor completa todos los campos requeridos");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Completa el formulario</h2>
                <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {schema.fields.map((field) => {
                    if (!shouldShowField(field)) return null;

                    if (field.type === 'header') {
                        return (
                            <div key={field.id} className="mt-6 mb-2">
                                <h3 className="text-md font-bold text-slate-800 whitespace-pre-wrap">{field.label}</h3>
                                {field.help_text && <p className="text-sm text-slate-500 mt-1">{field.help_text}</p>}
                            </div>
                        );
                    }

                    return (
                        <div key={field.id} className="flex flex-col">
                            <label className="text-sm font-bold text-slate-700 mb-1 flex items-center whitespace-pre-wrap">
                                {field.label}
                                {/* <span className="text-red-500 ml-1">*</span> */}
                            </label>
                            {field.help_text && <p className="text-xs text-slate-400 mb-2 whitespace-pre-wrap">{field.help_text}</p>}

                            {(field.type === 'text' || field.type === 'number') && (
                                <input
                                    type={field.type}
                                    value={formData[field.id] || ''}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    placeholder="Escribe tu respuesta aquí..."
                                />
                            )}

                            {field.type === 'select' && (
                                <div className="relative">
                                    <select
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-white"
                                    >
                                        <option value="" disabled>Selecciona una opción</option>
                                        {field.options?.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                </div>
                            )}

                            {field.type === 'multiselect' && (
                                <div className="grid grid-cols-1 gap-2">
                                    {field.options?.map((opt) => {
                                        const isSelected = (formData[field.id] || []).includes(opt);
                                        return (
                                            <div
                                                key={opt}
                                                onClick={() => handleMultiSelect(field.id, opt, field.validation?.max_selection)}
                                                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                    : 'bg-white border-slate-200 hover:border-emerald-200'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                                                    }`}>
                                                    {isSelected && <Check size={14} className="text-white" />}
                                                </div>
                                                <span className="text-sm font-medium">{opt}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {field.type === 'range' && (
                                <div className="px-2">
                                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                        <span>{field.labels?.min || field.min}</span>
                                        <span>{field.labels?.max || field.max}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={field.min || 1}
                                        max={field.max || 10}
                                        step={field.step || 1}
                                        value={formData[field.id] || Math.ceil((field.max || 10) / 2)}
                                        onChange={(e) => handleChange(field.id, parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="text-center font-bold text-emerald-600 mt-2 text-lg">
                                        {formData[field.id] || Math.ceil((field.max || 10) / 2)}
                                    </div>
                                </div>
                            )}

                            {errors[field.id] && (
                                <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 rounded-lg text-slate-500 font-medium hover:bg-slate-100 transition-colors"
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Guardando...' : 'Enviar Respuestas'}
                </button>
            </div>
        </form>
    );
}
