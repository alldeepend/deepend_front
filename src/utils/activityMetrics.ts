// Métricas adicionales opcionales de un registro de actividad física, además
// de duration (minutos, siempre obligatorio) — puramente informativas, nunca
// se usan en el Reto Semanal ni en el podio. Compartido entre el modal de
// registro (entrada) y las vistas de historial (lectura).

export interface ActivityMetricUnit {
    value: string;
    label: string;
}

export interface ActivityMetricType {
    id: 'distancia' | 'cantidad' | 'carga' | 'energia';
    label: string;
    placeholder: string;
    unitOptions: ActivityMetricUnit[];
}

export interface ActivityMetric {
    type: ActivityMetricType['id'];
    value: string;
    unit: string;
}

export const ACTIVITY_METRIC_TYPES: ActivityMetricType[] = [
    {
        id: 'distancia',
        label: 'Distancia',
        placeholder: 'Ej: 5',
        unitOptions: [
            { value: 'm', label: 'Metros' },
            { value: 'km', label: 'Kilómetros' },
            { value: 'ft', label: 'Pies' },
            { value: 'yd', label: 'Yardas' },
            { value: 'mi', label: 'Millas' },
        ],
    },
    {
        id: 'cantidad',
        label: 'Cantidad',
        placeholder: 'Ej: 20',
        unitOptions: [
            { value: 'reps', label: 'Repeticiones' },
            { value: 'pasos', label: 'Pasos' },
            { value: 'series', label: 'Series' },
        ],
    },
    {
        id: 'carga',
        label: 'Carga',
        placeholder: 'Ej: 20',
        unitOptions: [
            { value: 'kg', label: 'Kilogramos' },
            { value: 'lb', label: 'Libras' },
        ],
    },
    {
        id: 'energia',
        label: 'Energía',
        placeholder: 'Ej: 300',
        unitOptions: [
            { value: 'kcal', label: 'Calorías' },
        ],
    },
];

export const activityMetricTypeById = (id: string) => ACTIVITY_METRIC_TYPES.find(t => t.id === id);
