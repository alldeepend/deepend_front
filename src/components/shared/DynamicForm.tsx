import React, { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { C } from '../../styles/colors';

interface Field {
    id: string;
    type: string;
    label: string;
    help_text?: string;
    options?: (string | { label: string; value: string })[];
    condition?: {
        field: string;
        value?: string | any;
        values?: string[];
        rules?: { field: string, value?: any, values?: string[] }[];
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
    required?: boolean;
}

interface FormSchema {
    fields: Field[];
}

interface DynamicFormProps {
    schema: FormSchema;
    onSubmit: (data: any, rawData?: any) => void;
    onCancel: () => void;
    initialData?: any;
    isSubmitting?: boolean;
}

export default function DynamicForm({ schema, onSubmit, onCancel, initialData = {}, isSubmitting = false }: DynamicFormProps) {
    const [formData, setFormData] = useState<any>(initialData);
    const [errors, setErrors] = useState<any>({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingResponses, setPendingResponses] = useState<{ question: string; answer: any }[] | null>(null);

    const shouldShowField = (field: Field) => {
        const { condition } = field;
        if (!condition) return true;

        // Support for new multi-rule logic
        if ('rules' in condition && Array.isArray(condition.rules)) {
            // Field is shown if ANY rule matches (OR logic)
            return condition.rules.some(rule => {
                const dependentValue = formData[rule.field];
                if (dependentValue === undefined || dependentValue === null || dependentValue === '') return false;

                // 1. Array of allowed values (OR logic within one rule)
                const allowedValues = rule.values || (rule.value ? [rule.value] : []);

                if (Array.isArray(dependentValue)) {
                    // If dependent is multi-select, check if ANY of its values match ANY allowed values
                    return dependentValue.some(item =>
                        allowedValues.some((allowed: any) => String(allowed).trim() === String(item).trim())
                    );
                }

                // Simple equality check against any allowed value
                return allowedValues.some((allowed: any) =>
                    String(allowed).trim() === String(dependentValue).trim()
                );
            });
        }

        // Fallback for legacy single-rule logic (if any exists in DB)
        const legacyField = (condition as any).field;
        if (!legacyField) return true;

        const dependentValue = formData[legacyField];
        if (dependentValue === undefined || dependentValue === null || dependentValue === '') return false;

        const condVal = (condition as any).value;
        const condVals = (condition as any).values;

        if (condVals && Array.isArray(condVals)) {
            return condVals.some(allowed =>
                String(allowed).trim() === String(dependentValue).trim()
            );
        }

        if (condVal) {
            if (Array.isArray(dependentValue)) {
                return dependentValue.some(item =>
                    String(item).trim() === String(condVal).trim()
                );
            }
            return String(dependentValue).trim() === String(condVal).trim();
        }

        return true;
    };

    // Auto-clear hidden fields values to maintain data integrity and trigger cascading visibility
    React.useEffect(() => {
        let changed = false;
        const newFormData = { ...formData };

        schema.fields.forEach(field => {
            if (field.type !== 'header' && formData[field.id] !== undefined && !shouldShowField(field)) {
                delete newFormData[field.id];
                changed = true;
            }
        });

        if (changed) {
            setFormData(newFormData);
        }
    }, [formData, schema.fields]);

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

            // Required field validation
            if (field.required && field.type !== 'header') {
                const value = formData[field.id];
                if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    newErrors[field.id] = 'Este campo es obligatorio';
                    isValid = false;
                }
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

    const buildResponses = () =>
        schema.fields
            .filter(field => shouldShowField(field) && field.type !== 'header')
            .map(field => {
                let answer = formData[field.id];
                if (Array.isArray(answer)) answer = answer.join(', ');
                if (field.type === 'select' && field.options) {
                    const selectedOpt = field.options.find((o: any) =>
                        (typeof o === 'object' ? o.value : o) === answer
                    );
                    if (selectedOpt && typeof selectedOpt === 'object') answer = (selectedOpt as any).label;
                }
                return { question: field.label, answer };
            })
            .filter(item => item.answer !== undefined && item.answer !== null && item.answer !== '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setPendingResponses(buildResponses());
            setShowConfirm(true);
        } else {
            alert("Por favor completa todos los campos requeridos");
        }
    };

    const handleConfirmSubmit = () => {
        setShowConfirm(false);
        if (pendingResponses) onSubmit(pendingResponses, formData);
        setPendingResponses(null);
    };

    return (
        <>
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold" style={{ color: C.text }}>Completa el formulario</h2>
                <button type="button" onClick={onCancel} style={{ color: C.label }}>
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {schema.fields.map((field) => {
                    if (!shouldShowField(field)) return null;

                    if (field.type === 'header') {
                        return (
                            <div key={field.id} className="mt-6 mb-2">
                                <h3
                                    className="text-md whitespace-pre-wrap rich-text-content"
                                    style={{ color: C.text }}
                                    dangerouslySetInnerHTML={{ __html: field.label }}
                                />
                                {field.help_text && (
                                    <div
                                        className="text-sm mt-1 rich-text-content"
                                        style={{ color: C.textMuted }}
                                        dangerouslySetInnerHTML={{ __html: field.help_text.replaceAll('&nbsp;', ' ') }}
                                    />
                                )}
                            </div>
                        );
                    }

                    return (
                        <div key={field.id} className="flex flex-col">
                            <label className="text-sm font-bold mb-1 flex items-center whitespace-pre-wrap" style={{ color: C.textSec }}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {field.help_text && (
                                <p
                                    className="text-s text-[#202224] mb-2 whitespace-pre-wrap rich-text-content"
                                    dangerouslySetInnerHTML={{ __html: field.help_text.replaceAll('&nbsp;', ' ') }}
                                />
                            )}

                            {(field.type === 'text' || field.type === 'number') && (
                                <input
                                    type={field.type}
                                    value={formData[field.id] || ''}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all"
                                    style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                    placeholder="Escribe tu respuesta aquí..."
                                />
                            )}

                            {field.type === 'select' && (
                                <div className="relative">
                                    <select
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border outline-none transition-all appearance-none"
                                        style={{ background: C.surface2, borderColor: C.border, color: C.text }}
                                    >
                                        <option value="" disabled>Selecciona una opción</option>
                                        {field.options?.map((opt: any) => {
                                            const label = typeof opt === 'object' ? opt.label : opt;
                                            const value = typeof opt === 'object' ? opt.value : opt;
                                            return <option key={value} value={value}>{label}</option>;
                                        })}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.label }} size={20} />
                                </div>
                            )}

                            {field.type === 'multiselect' && (
                                <div className="grid grid-cols-1 gap-2">
                                    {field.options?.map((opt) => {
                                        const value = typeof opt === 'object' ? opt.value : opt;
                                        const label = typeof opt === 'object' ? opt.label : opt;
                                        const isSelected = (formData[field.id] || []).includes(value);
                                        return (
                                            <div
                                                key={value}
                                                onClick={() => handleMultiSelect(field.id, value, field.validation?.max_selection)}
                                                className="flex items-center p-3 rounded-xl border cursor-pointer transition-all"
                                            style={isSelected
                                                ? { background: C.forest, borderColor: C.green, color: C.green }
                                                : { background: C.surface1, borderColor: C.border, color: C.text }}
                                            >
                                                <div className="w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors"
                                                    style={isSelected ? { background: C.green, borderColor: C.green } : { background: C.surface2, borderColor: C.border }}
                                                >
                                                    {isSelected && <Check size={14} className="text-white" />}
                                                </div>
                                                <span className="text-sm font-medium">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {field.type === 'range' && (
                                <div className="px-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.label }}>
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
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        style={{ background: C.surface3 }}
                                    />
                                    <div className="text-center font-bold mt-2 text-lg" style={{ color: C.green }}>
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

            <div className="flex justify-end gap-4 pt-4 border-t" style={{ borderColor: C.border }}>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 rounded-lg font-medium transition-colors"
                    style={{ color: C.textMuted }}
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 rounded-lg text-white font-bold transition-colors disabled:opacity-50"
                    style={{ background: C.green }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Guardando...' : 'Enviar Respuestas'}
                </button>
            </div>
        </form>

        <ConfirmModal
            isOpen={showConfirm}
            title="Enviar respuestas"
            message="¿Estás seguro de que deseas enviar tus respuestas? No podrás editarlas después."
            confirmLabel="Enviar"
            onConfirm={handleConfirmSubmit}
            onCancel={() => setShowConfirm(false)}
        />
        </>
    );
}
