// Copia independiente del contenido introductorio del reto físico "Desde Aquí"
// (video + texto + formulario de punto de partida). No tiene ningún vínculo con
// las tablas del reto viejo — es contenido propio de Reto Semanal.

export const INTRO_VIDEO_URL = 'https://youtu.be/7FaJpQuYkb0';
export const INTRO_VIDEO_TITLE = '🎙️ Tengo algo que decirte';

export const INTRO_TEXT_TITLE = '🚩 Esto empieza desde donde estás';
export const INTRO_TEXT_HTML = `<h3><strong>&quot;Desde&nbsp;Aquí&quot;</strong>&nbsp;no&nbsp;se&nbsp;trata&nbsp;de&nbsp;hacerlo&nbsp;perfecto,&nbsp;ni&nbsp;de&nbsp;competir&nbsp;por&nbsp;quién&nbsp;hace&nbsp;más,&nbsp;sino&nbsp;de&nbsp;construir&nbsp;un&nbsp;ritmo&nbsp;físico&nbsp;real,&nbsp;posible&nbsp;y&nbsp;sostenible&nbsp;para&nbsp;ti,&nbsp;así&nbsp;es:&nbsp;<strong>para&nbsp;ti</strong>.</h3><h3></h3><h3>Durante&nbsp;<strong>8&nbsp;semanas</strong>&nbsp;vas&nbsp;a&nbsp;registrar&nbsp;tus&nbsp;minutos&nbsp;de&nbsp;movimiento&nbsp;y&nbsp;avanzar&nbsp;hacia&nbsp;una&nbsp;meta&nbsp;personal.</h3><h3></h3><h3>La&nbsp;idea&nbsp;de&nbsp;base&nbsp;es&nbsp;simple:&nbsp;Moverte&nbsp;con&nbsp;lo&nbsp;que&nbsp;tienes&nbsp;hoy.&nbsp;Si&nbsp;vas&nbsp;fuerte,&nbsp;sostenlo.&nbsp;Si&nbsp;vas&nbsp;lento,&nbsp;sigue.&nbsp;Si&nbsp;pausaste,&nbsp;vuelve.&nbsp;Aquí&nbsp;no&nbsp;usamos&nbsp;la&nbsp;pausa&nbsp;como&nbsp;culpa;&nbsp;la&nbsp;usamos&nbsp;como&nbsp;punto&nbsp;de&nbsp;regreso.</h3><h3></h3><h3><strong>Tu&nbsp;Reto:</strong>&nbsp;Muévete&nbsp;<em>(fluye)</em>,&nbsp;registra&nbsp;tus&nbsp;minutos&nbsp;y&nbsp;vuelve&nbsp;a&nbsp;tu&nbsp;ritmo&nbsp;una&nbsp;semana&nbsp;a&nbsp;la&nbsp;vez.&nbsp;</h3><h3></h3><h3>💭&nbsp;<strong><em>Recuerda:&nbsp;</em></strong><em>&quot;Aquí&nbsp;tú&nbsp;trazas&nbsp;tu&nbsp;camino,&nbsp;pero&nbsp;no&nbsp;vas&nbsp;sol@&quot;.</em></h3>`;

export const INTRO_FORM_SCHEMA = {
    fields: [
        {
            id: 'field_relacion_movimiento',
            type: 'select',
            label: '🫱🏻‍🫲🏻 ¿Cuál fue tu relación con el movimiento (actividad física) en las últimas semanas?',
            options: ['Constante', 'Intermitente', 'Pausada', 'Volviendo', 'No hubo'],
            required: true,
            help_text: '<p><em>Selecciona la que más se ajusta al momento</em></p>',
        },
        {
            id: 'field_tipo_movimiento',
            type: 'multiselect',
            label: '👍🏻 ¿Qué tipo de movimiento quieres sostener estas 12 semanas?',
            options: ['Caminar', 'Gym', 'Correr', 'Yoga', 'Bici', 'Baile', 'Otro (¿Cuál?)'],
            required: true,
            help_text: '<p><em>Selecciona la que más se ajusta a este momento</em></p>',
        },
        {
            id: 'field_dias_reales',
            type: 'select',
            label: '🔢 ¿Cuántos días reales puedes moverte por semana?',
            options: ['1', '2', '3', '4', '5+'],
            required: true,
            help_text: '<p><em>Selecciona la que más se ajusta a este momento</em></p>',
        },
        {
            id: 'field_minimo_viable',
            type: 'select',
            label: '🎯 ¿Cuál es tu mínimo viable cuando la semana se complica?',
            options: ['10 minutos', '15 minutos', '20 minutos', '30 minutos'],
            required: true,
            help_text: '<p><em>Selecciona la que más se ajusta a esa situación</em></p>',
        },
        {
            id: 'field_saca_ritmo',
            type: 'multiselect',
            label: '🤯 ¿Qué suele sacarte del ritmo?',
            options: ['Tiempo', 'Cansancio', 'Viajes', 'Ánimo', 'Familia', 'Trabajo', 'Dolor', 'Otro (¿Cuál?)'],
            required: true,
            help_text: '<p><em>Selecciona la que más se parezca a ti</em></p>',
        },
        {
            id: 'field_dejar_pelear',
            type: 'select',
            label: '🫸🏻 Esta vez, ¿qué necesitas dejar de pelear?',
            options: ['Mi Cuerpo', 'Mi Horario', 'Mi Energía', 'Mi Pausa', 'Mi Comparación', 'Mi Exigencia'],
            required: true,
            help_text: '<p><em>Selecciona la que más se ajusta a este momento</em></p>',
        },
        {
            id: 'field_compromiso',
            type: 'text',
            label: '✊🏻 Completa: "Durante estas 12 semanas, mi compromiso realista es…"',
            required: true,
            help_text: '<p><em>Escribe lo que más se ajusta para ti este momento</em></p>',
        },
    ],
};
