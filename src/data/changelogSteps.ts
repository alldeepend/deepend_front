import {
    Sparkles,
    Newspaper,
    MessageCircle,
    Globe,
    Compass,
    Palette,
    SkipForward,
    Mic,
    Archive,
    CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Debe coincidir con CHANGELOG_VERSION en deepend_back/src/constants/changelog.js
export const CHANGELOG_VERSION = '2026-07';

export type ChangelogStep = {
    type: 'center' | 'spot';
    target?: string;
    side?: 'left' | 'right';
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    text: string;
    last?: boolean;
};

export const CHANGELOG_STEPS: ChangelogStep[] = [
    {
        type: 'center',
        icon: Sparkles,
        eyebrow: 'Notas de la versión',
        title: 'Esto es lo nuevo en DeepEnd',
        text: 'Un repaso rápido de lo que agregamos desde el rediseño oscuro de la plataforma. Toma un minuto.',
    },
    {
        type: 'spot',
        target: '#tour-target-noticias',
        side: 'right',
        icon: Newspaper,
        eyebrow: 'Nueva sección',
        title: 'Noticias',
        text: 'Entérate de lo último de la comunidad. Si eres admin, también puedes publicar las tuyas desde aquí mismo.',
    },
    {
        type: 'spot',
        target: '#tour-target-whatsapp',
        side: 'left',
        icon: MessageCircle,
        eyebrow: 'Ayuda directa',
        title: 'Escríbenos por WhatsApp',
        text: 'Este botón te acompaña en Dashboard, Mundos y Perfil por si tienes una duda a un toque de distancia.',
    },
    {
        type: 'center',
        icon: Globe,
        eyebrow: 'Todo nuevo',
        title: 'Mundos y Viajes',
        text: 'Una forma distinta de avanzar: viajes con mundos y estaciones, un Reto Puerta de 7 días antes de empezar cada uno, insignias y XP a tu ritmo.',
    },
    {
        type: 'center',
        icon: Compass,
        eyebrow: 'También nuevo',
        title: 'El test de arquetipo',
        text: 'Descubre tu arquetipo y guárdalo en tu perfil automáticamente. Lo puedes revisar cuando quieras desde el sidebar de Mundos.',
    },
    {
        type: 'center',
        icon: Palette,
        eyebrow: 'Nueva cara',
        title: 'Landing page renovada',
        text: 'La primera impresión de DeepEnd tiene diseño nuevo, con testimonios reales de la comunidad.',
    },
    {
        type: 'center',
        icon: SkipForward,
        eyebrow: 'Más flexibilidad',
        title: 'Salta lo que prefieras',
        text: '"Ya lo hice, pero prefiero guardarlo para mí" ya está disponible en cualquier tipo de pregunta dentro de una estación.',
    },
    {
        type: 'center',
        icon: Mic,
        eyebrow: 'Comunidad',
        title: 'Testimonios con voz propia',
        text: 'Escucha, en audio real, lo que otros usuarios de DeepEnd cuentan sobre su experiencia.',
    },
    {
        type: 'center',
        icon: Archive,
        eyebrow: 'Un vistazo atrás',
        title: 'Retos Antiguos, ahora de recuerdo',
        text: 'Con Mundos y Viajes como el nuevo camino, los Retos Antiguos quedan en la sección Retos como un lindo recuerdo de tu progreso pasado.',
    },
    {
        type: 'center',
        icon: CheckCircle2,
        eyebrow: 'Eso es todo por ahora',
        title: 'Seguimos sumando cosas',
        text: 'La próxima vez que haya novedades, te avisamos aquí mismo.',
        last: true,
    },
];
