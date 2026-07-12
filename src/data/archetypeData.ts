export type ArchNum = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface ArchScore {
  arch: ArchNum
  variant: 'A' | 'B' | null
}

export interface QuestionOption {
  label: string
  text: string
  scores: ArchScore[]
}

export interface MCQuestion {
  id: number
  text: string
  options: QuestionOption[]
}

export interface LikertQuestion {
  id: number
  text: string
  archs: [ArchNum, ArchNum]
}

export interface ArchetypeResult {
  key: string
  name: string
  variant: string
  pattern: string
  cost: string
  strengths: string
  microAction: string
}

// ─── BLOQUE 0 — contexto (no puntúa) ────────────────────────────────────────
export const BLOCK0: MCQuestion[] = [
  {
    id: 1,
    text: '¿En qué área de tu vida sientes que hay algo importante que llevas posponiendo?',
    options: [
      { label: 'A', text: 'Trabajo, carrera o negocio', scores: [] },
      { label: 'B', text: 'Salud o hábitos físicos', scores: [] },
      { label: 'C', text: 'Relaciones o vida personal', scores: [] },
      { label: 'D', text: 'Finanzas o proyectos económicos', scores: [] },
      { label: 'E', text: 'Algo creativo o un propósito personal', scores: [] },
    ],
  },
  {
    id: 2,
    text: '¿Cuánto tiempo llevas con eso pendiente?',
    options: [
      { label: 'A', text: 'Menos de 3 meses', scores: [] },
      { label: 'B', text: 'Entre 3 meses y un año', scores: [] },
      { label: 'C', text: 'Entre uno y tres años', scores: [] },
      { label: 'D', text: 'Más de tres años', scores: [] },
    ],
  },
]

// ─── BLOQUE 1 — diagnóstico principal (12 preguntas, +2 pts por arquetipo) ──
export const BLOCK1: MCQuestion[] = [
  {
    id: 3,
    text: 'Tienes algo que quieres hacer y los recursos básicos para hacerlo. ¿Qué pasa más seguido?',
    options: [
      { label: 'A', text: 'Siento que me falta prepararme un poco más antes de dar el paso', scores: [{ arch: 1, variant: null }] },
      { label: 'B', text: 'Busco más información, más referencias, más contexto antes de empezar', scores: [{ arch: 4, variant: null }] },
      { label: 'C', text: 'Empiezo pero en algún punto pierdo el hilo y lo dejo incompleto', scores: [{ arch: 7, variant: 'B' }] },
      { label: 'D', text: 'Generalmente cuando tengo lo necesario, me muevo sin pensarlo demasiado', scores: [] },
    ],
  },
  {
    id: 4,
    text: 'Cuando imaginas algo que quieres construir o cambiar en tu vida, ¿qué haces con esa idea?',
    options: [
      { label: 'A', text: 'La guardo. Rara vez la digo en voz alta hasta no tener algo concreto que mostrar', scores: [{ arch: 2, variant: 'A' }] },
      { label: 'B', text: 'La comento pero después no pasa mucho — la energía se queda en la conversación', scores: [{ arch: 2, variant: 'B' }] },
      { label: 'C', text: 'La estructuro, la planifico, le pongo etapas — aunque a veces el plan no arranca', scores: [{ arch: 7, variant: 'A' }] },
      { label: 'D', text: 'La digo, la anoto y busco el primer paso concreto relativamente rápido', scores: [] },
    ],
  },
  {
    id: 5,
    text: 'Cuando algo importante en tu vida no avanza, ¿cuál es la explicación que más aparece?',
    options: [
      { label: 'A', text: 'El momento no está dado: hay algo externo que todavía no está alineado', scores: [{ arch: 5, variant: 'A' }] },
      { label: 'B', text: 'Otras áreas de mi vida están demandando toda mi energía ahora mismo', scores: [{ arch: 6, variant: null }] },
      { label: 'C', text: 'No tengo claro qué sigue y eso me frena', scores: [{ arch: 7, variant: 'A' }] },
      { label: 'D', text: 'Generalmente identifico qué me frena y lo trabajo directamente', scores: [] },
    ],
  },
  {
    id: 6,
    text: 'Piensa en algo que has intentado más de una vez sin lograrlo. ¿Qué crees que ha pasado?',
    options: [
      { label: 'A', text: 'Creo que me falta algo — más habilidad, más preparación, más recursos', scores: [{ arch: 1, variant: null }] },
      { label: 'B', text: 'Honestamente no sé bien qué salió mal — vuelvo a intentarlo de forma parecida', scores: [{ arch: 4, variant: 'B' }] },
      { label: 'C', text: 'El contexto no ha sido el correcto — cuando las condiciones cambien, va a funcionar', scores: [{ arch: 5, variant: null }] },
      { label: 'D', text: 'He podido identificar qué falló y ajustar el enfoque cada vez', scores: [] },
    ],
  },
  {
    id: 7,
    text: 'Cuando tienes un proyecto o decisión importante, ¿con quién lo trabajas?',
    options: [
      { label: 'A', text: 'Lo resuelvo solo la mayor parte del tiempo — prefiero no depender de otros para avanzar', scores: [{ arch: 3, variant: 'A' }] },
      { label: 'B', text: 'Espero que alguien más tome la iniciativa o me convoque — me cuesta arrancar solo', scores: [{ arch: 3, variant: 'B' }] },
      { label: 'C', text: 'Lo comparto con algunos pero en el fondo las decisiones las tomo solo', scores: [{ arch: 2, variant: 'A' }, { arch: 3, variant: 'A' }] },
      { label: 'D', text: 'Busco personas que complementen lo que me falta y trabajo activamente con ellas', scores: [] },
    ],
  },
  {
    id: 8,
    text: '¿Cómo describes tu relación con el error o el fracaso?',
    options: [
      { label: 'A', text: 'Lo evito tanto como puedo — prefiero esperar a tener más claridad antes de arriesgarme', scores: [{ arch: 1, variant: null }, { arch: 4, variant: 'A' }] },
      { label: 'B', text: 'Me afecta más de lo que quisiera — tardo en retomar después de que algo no funciona', scores: [{ arch: 1, variant: 'A' }] },
      { label: 'C', text: 'Lo proceso pero rara vez me detengo a revisar qué me dejó — vuelvo a moverme rápido', scores: [{ arch: 4, variant: 'B' }] },
      { label: 'D', text: 'Lo tomo como información útil — me incomoda pero no me paraliza', scores: [] },
    ],
  },
  {
    id: 9,
    text: 'Piensa en tu semana típica. ¿Cómo llega lo que más te importa construir?',
    options: [
      { label: 'A', text: 'Casi nunca tiene espacio — lo urgente siempre gana', scores: [{ arch: 6, variant: 'B' }] },
      { label: 'B', text: 'Lo tengo en el plan pero cuando llega su momento, algo lo desplaza', scores: [{ arch: 6, variant: 'A' }, { arch: 7, variant: null }] },
      { label: 'C', text: 'Arranco con energía al inicio de la semana pero se diluye en el camino', scores: [{ arch: 7, variant: 'B' }] },
      { label: 'D', text: 'Le asigno tiempo concreto y generalmente lo cumplo aunque no siempre', scores: [] },
    ],
  },
  {
    id: 10,
    text: 'Cuando piensas en pedir ayuda o unirte a otros para avanzar en algo, ¿qué sientes?',
    options: [
      { label: 'A', text: 'Incomodidad — siento que debería poder con esto solo', scores: [{ arch: 3, variant: 'A' }] },
      { label: 'B', text: 'Reserva — no estoy listo para que otros vean en qué etapa está esto', scores: [{ arch: 2, variant: 'A' }] },
      { label: 'C', text: 'Algo de pereza — coordinar con otros a veces toma más energía que hacerlo solo', scores: [{ arch: 3, variant: null }] },
      { label: 'D', text: 'Lo busco naturalmente — sé que avanzar con otros me da resultados que solo no consigo', scores: [] },
    ],
  },
  {
    id: 11,
    text: '¿Cómo describes tu relación con los planes que haces?',
    options: [
      { label: 'A', text: 'Los hago detallados y completos — pero a veces el plan se queda en el papel', scores: [{ arch: 7, variant: 'A' }] },
      { label: 'B', text: 'Los hago pero cuando las condiciones cambian, siento que ya no aplican y los abandono', scores: [{ arch: 5, variant: null }] },
      { label: 'C', text: 'Empiezo a planear y termino revisando antes de ejecutar más veces de las que quisiera', scores: [{ arch: 7, variant: 'A' }] },
      { label: 'D', text: 'Planifico lo suficiente para tener dirección y luego ajusto mientras ejecuto', scores: [] },
    ],
  },
  {
    id: 12,
    text: 'Cuando algo externo se complica — economía, trabajo, relaciones — ¿qué pasa con tus proyectos personales?',
    options: [
      { label: 'A', text: 'Los pongo en pausa hasta que lo externo se estabilice', scores: [{ arch: 5, variant: null }, { arch: 6, variant: 'A' }] },
      { label: 'B', text: 'Sigo moviéndome pero con mucha culpa por no estar atendiendo lo que se complicó', scores: [{ arch: 6, variant: null }] },
      { label: 'C', text: 'Me enfoco tanto en resolver lo externo que lo personal desaparece del mapa', scores: [{ arch: 6, variant: 'B' }] },
      { label: 'D', text: 'Trato de mantener aunque sea algo en movimiento — no todo, pero algo', scores: [] },
    ],
  },
  {
    id: 13,
    text: '¿Cuándo fue la última vez que hiciste algo importante sin sentirte completamente listo?',
    options: [
      { label: 'A', text: 'No recuerdo — generalmente espero a sentirme seguro antes de moverme', scores: [{ arch: 1, variant: null }] },
      { label: 'B', text: 'Ha pasado pero fue hace tiempo — últimamente prefiero tener más claridad primero', scores: [{ arch: 1, variant: null }] },
      { label: 'C', text: 'Tengo cosas en mente que quiero hacer pero las estoy madurando todavía', scores: [{ arch: 2, variant: 'A' }] },
      { label: 'D', text: 'Relativamente seguido — sé que la seguridad viene de hacer, no de esperar', scores: [] },
    ],
  },
  {
    id: 14,
    text: 'Cuando te imaginas compartiendo con otros en qué estás trabajando, ¿qué aparece?',
    options: [
      { label: 'A', text: 'Prefiero no hacerlo todavía — quiero tener algo más sólido para mostrar', scores: [{ arch: 2, variant: 'A' }] },
      { label: 'B', text: 'Lo hago pero después me doy cuenta de que las palabras no se convirtieron en pasos', scores: [{ arch: 2, variant: 'B' }] },
      { label: 'C', text: 'Me cuesta — siento que mostrarlo me hace vulnerable a opiniones que me pueden frenar', scores: [{ arch: 3, variant: 'A' }] },
      { label: 'D', text: 'Lo hago con naturalidad — compartirlo me ayuda a clarificar y a comprometerme', scores: [] },
    ],
  },
]

// ─── BLOQUE 2 — detección secundaria (Likert 1-4, puntaje directo) ───────────
export const BLOCK2: LikertQuestion[] = [
  { id: 15, text: '"Hay cosas en mi vida que llevo queriendo hacer pero que nadie a mi alrededor sabe que existen."', archs: [2, 3] },
  { id: 16, text: '"Cuando algo no sale como esperaba, mi primer movimiento es intentarlo de nuevo — no necesariamente de forma diferente."', archs: [4, 7] },
  { id: 17, text: '"Soy más capaz de decirle a alguien más que empiece que de aplicarme eso mismo a mí."', archs: [1, 2] },
  { id: 18, text: '"El equilibrio en mi vida es algo que busco pero que siento que siempre está un paso adelante de donde estoy."', archs: [6, 5] },
]

export const ARCHETYPE_NAMES: Record<ArchNum, string> = {
  1: 'El que espera estar listo',
  2: 'El guardián de ideas',
  3: 'El solitario productivo',
  4: 'El que estudia más',
  5: 'El que espera el momento',
  6: 'El equilibrista',
  7: 'El eterno planificador',
}

// ─── 14 RESULTADOS ───────────────────────────────────────────────────────────
export const RESULTS: Record<string, ArchetypeResult> = {
  '1A': {
    key: '1A',
    name: 'El que espera estar listo',
    variant: 'La exigencia sin fondo',
    pattern: 'Tienes lo que necesitas para empezar. No es una opinión — es lo que muestran tus respuestas. El problema no está en lo que te falta sino en la vara con la que te mides: una que nunca llega al piso. Le dirías a cualquier persona cercana que ya está lista para hacer lo que quiere hacer. A ti mismo no te lo has dicho todavía. En algún punto aprendiste que merecer algo requiere ganárselo primero — y la cuenta nunca cierra del todo.',
    cost: 'Tiempo, principalmente. Tiempo en el que algo que importa lleva esperando mientras terminas de prepararte. También ha costado la versión de ti que ya existía hace un año — la que tenía exactamente lo que tienes ahora y que tampoco arrancó. La exigencia que te aplicas no te ha hecho más capaz. Te ha mantenido quieto.',
    strengths: 'Nadie llega tan preparado como tú cuando finalmente se mueve. La atención que le pones a cada detalle, la conciencia que tienes de lo que podría fallar, la seriedad con la que tomas lo que importa — son reales y son valiosas. El problema nunca fue la calidad de tu preparación. Fue el momento en que decidiste que prepararse era el destino en lugar del camino.',
    microAction: 'Elige una cosa — una sola — que llevas posponiendo porque no te sientes listo. No la hagas perfecta. Hazla en el estado en que estás ahora. Ponle una fecha antes del viernes y dísela a alguien que te vaya a preguntar si la hiciste.',
  },
  '1B': {
    key: '1B',
    name: 'El que espera estar listo',
    variant: 'La paz que detiene',
    pattern: 'Por fuera hay tranquilidad. No hay urgencia visible, no hay ansiedad obvia. Hay una disposición a dejar que las cosas lleguen cuando tengan que llegar — y eso en muchos contextos es genuinamente sabio. Pero si miras el historial de lo que has querido y no has movido, verás que esa paz ha tenido un costo silencioso. Lo que empezó como aceptación se fue convirtiendo, sin que se notara, en una forma de no tener que elegir.',
    cost: 'No se siente como pérdida porque no hay drama visible. Eso lo hace más difícil de ver. Lo que se ha ido son las versiones de proyectos, relaciones o decisiones que nunca tuvieron la oportunidad de probarse en la realidad. No porque no fueran posibles — sino porque la calma se convirtió en el lugar donde todo podía seguir siendo posible sin tener que enfrentarse con nada.',
    strengths: 'Tienes una capacidad de regulación emocional que mucha gente no tiene. No reaccionas impulsivamente, no tomas decisiones desde el miedo, sabes esperar cuando esperar tiene sentido. Eso es genuinamente valioso. Lo que hace falta no es más urgencia — es aprender a distinguir cuándo la calma es sabiduría y cuándo es distancia.',
    microAction: 'Escribe — en papel o donde quieras — una cosa que llevas queriendo y que no has dicho en voz alta todavía. No la compartas si no quieres. Solo ponle palabras. Ver lo que existe en tu cabeza convertido en texto concreto ya es un primer movimiento real.',
  },
  '2A': {
    key: '2A',
    name: 'El guardián de ideas',
    variant: 'La visión guardada',
    pattern: 'Hay cosas que quieres hacer que prácticamente nadie en tu vida sabe que existen. Las guardas como si fueran frágiles — como si decirlas en voz alta las expusiera a que alguien las juzgue, las malentienda, o simplemente no esté a la altura de lo que significan. Mientras no las dices, siguen siendo posibles y perfectas. Lo que no calculas es que esa posibilidad permanente tiene el mismo efecto que no tenerlas: nada se mueve.',
    cost: 'Ideas que podrían haber existido en el mundo hace meses o años. Conversaciones que no ocurrieron. Personas que podrían haberse sumado y que nunca supieron que había algo a lo que sumarse. Y el desgaste interno de cargar con algo que importa sin tener con quién compartirlo — porque compartirlo significaría comprometerse, y comprometerse significa que ya no puede ser solo tuyo.',
    strengths: 'Tienes una riqueza interna que mucha gente no tiene. La calidad de lo que piensas, la profundidad con la que procesas las cosas, la claridad de tu visión cuando logras articularlo — son reales. El problema no es lo que hay adentro. Es que adentro no tiene efecto en el mundo.',
    microAction: 'Dile a una persona — una sola — algo que llevas guardando. No el proyecto completo, no la explicación perfecta. Una oración que empiece con "hay algo que quiero hacer" y que termine con lo más concreto que puedas decir sobre qué es. Sin agregar "lo estoy pensando todavía."',
  },
  '2B': {
    key: '2B',
    name: 'El guardián de ideas',
    variant: 'Las palabras sin raíz',
    pattern: 'Hablas de tus proyectos con soltura. Los compartes, los anuncias, a veces los describes con un nivel de detalle que hace que suenen muy reales. Y en el momento en que lo haces, la intención es genuina. El problema es lo que pasa después: decirlo produce una sensación tan parecida a haber avanzado que la energía que necesitaba el primer paso concreto ya se gastó en la declaración. Seis meses después, no puedes explicar bien qué pasó.',
    cost: 'Credibilidad, primero contigo mismo. Cuando la distancia entre lo que dices y lo que haces se repite, empiezas a creerle menos a tus propias palabras — aunque no lo notes. También ha costado relaciones y oportunidades: personas que estuvieron dispuestas a sumarse y que con el tiempo dejaron de preguntar cómo iba eso que ibas a hacer.',
    strengths: 'Tienes una capacidad de comunicación y de visión que mueve a otros. Cuando describes algo que quieres construir, la gente lo ve. Eso no es menor — es exactamente lo que hace falta para convocar, para liderar, para generar movimiento en otros. Lo que falta es dirigir esa misma energía hacia el primer paso que no puede deshacerse.',
    microAction: 'Elige algo que ya has anunciado antes. No lo anuncies de nuevo. En cambio, haz una sola cosa concreta relacionada con eso — algo que puedas verificar que ocurrió — antes del viernes. Sin contárselo a nadie primero.',
  },
  '3A': {
    key: '3A',
    name: 'El solitario productivo',
    variant: 'El que carga sin pedir',
    pattern: 'Puedes con mucho — eso está claro y es genuino. Pero hay un costo que no siempre aparece en el balance: que las cosas que más importan, las más grandes, las más transformadoras, las has cargado solo. No porque no haya nadie. Sino porque pedir ayuda tiene un sabor particular que no te gusta — deberle algo a alguien, que vean que no puedes solo, o simplemente la incomodidad de necesitar.',
    cost: 'Velocidad, principalmente. Lo que podrías haber avanzado en seis meses con otros lo has estado construyendo solo durante años. También ha costado la profundidad de algunos resultados — hay cosas que solo pueden existir cuando dos o más personas las construyen juntas, y esas cosas todavía no existen en tu vida.',
    strengths: 'Tu autonomía es real y es valiosa. Sabes organizarte, sabes sostenerte, sabes avanzar sin que nadie te esté empujando. Eso en un entorno colectivo se convierte en una capacidad de liderazgo — porque no dependes del estado de ánimo del grupo para moverte. Lo que falta no es menos independencia sino aprender cuándo la independencia sirve y cuándo te está costando más de lo que te está dando.',
    microAction: 'Identifica algo que llevas cargando solo. No tienes que soltarlo todo. Elige una parte — una tarea, una decisión, una conversación — y pídele a alguien específico que se involucre. Sin explicar demasiado por qué lo estás pidiendo.',
  },
  '3B': {
    key: '3B',
    name: 'El solitario productivo',
    variant: 'El que espera que alguien jale',
    pattern: 'Cuando alguien te convoca, participas. Cuando alguien propone, te sumas. Cuando hay un contexto, una comunidad, una persona que toma la iniciativa — estás. Pero cuando nadie llama, te quedas. No por falta de claridad sobre lo que quieres — sino porque arrancar sin que alguien más lo inicie tiene un riesgo que has aprendido a no asumir.',
    cost: 'Proyectos que no empezaron porque nadie los convocó. Momentos en que sí había con quién, pero nadie propuso, y el silencio fue suficiente para que todo se quedara donde estaba. Y la sensación acumulada de que eres más capaz de lo que tu historial de iniciativas propias muestra.',
    strengths: 'Eres extraordinariamente valioso en un equipo. Cuando hay un contexto que te sostiene, produces con una consistencia que mucha gente no tiene. El problema no es que necesites a otros — eso no es debilidad. El problema es que has confundido necesitar un equipo con necesitar que alguien más tome siempre la iniciativa. Las dos cosas son diferentes.',
    microAction: 'Propón algo. No esperes que te llamen. Escríbele a una persona específica esta semana con una idea concreta de algo que quieras hacer juntos. No tiene que ser grande. Tiene que ser tuyo.',
  },
  '4A': {
    key: '4A',
    name: 'El que estudia más',
    variant: 'El que espera saber suficiente',
    pattern: 'Llevas tiempo preparándote para algo que todavía no empieza. No por falta de disciplina — al contrario, la disciplina está ahí y es real. Hay cursos, libros, conversaciones, investigación. Lo que no hay es un primer intento real. Y cada vez que sientes que ya tienes lo suficiente para moverte, aparece algo que muestra que todavía falta más. El umbral se mueve junto contigo.',
    cost: 'El tipo de aprendizaje que más necesitas no está disponible antes de actuar. Solo existe adentro del intento — en lo que sale diferente a lo esperado. Cada mes que pasa preparándote es un mes sin ese aprendizaje. Y paradójicamente, más preparación sin acción no te acerca al punto donde te sientas listo — te aleja.',
    strengths: 'Cuando finalmente te mueves, llegas con una profundidad que la mayoría no tiene. Tu capacidad de investigar, de entender contextos, de anticipar problemas — son reales y te dan ventaja cuando están al servicio de la acción. El problema no es cuánto sabes. Es que el saber se convirtió en el destino en lugar del punto de partida.',
    microAction: 'Elige algo que llevas estudiando o preparando. Identifica el mínimo con el que podrías hacer un primer intento real — aunque sea pequeño, aunque sea imperfecto. Hazlo antes del viernes. No lo prepares más. Hazlo.',
  },
  '4B': {
    key: '4B',
    name: 'El que estudia más',
    variant: 'El que repite sin aprender',
    pattern: 'Sí te mueves. Eso es claro y real. El patrón no es de parálisis — es de repetición. Hay proyectos que se caen siempre en el mismo punto, decisiones que producen resultados parecidos, intentos que empiezan con energía diferente pero terminan en un lugar familiar. Lo que no está ocurriendo es la pausa para revisar qué tenía para enseñar el intento anterior antes de lanzar el siguiente.',
    cost: 'Tiempo y energía que se ha gastado en ciclos que se repiten en lugar de en ciclos que suben. También ha costado la confianza propia — porque cuando el patrón se repite sin que sepas bien por qué, empiezas a dudar de tu capacidad en lugar de dudar de tu método. Y son cosas muy diferentes.',
    strengths: 'Tu disposición a intentar de nuevo después de que algo no funciona no es menor — mucha gente no la tiene. La resiliencia está ahí. Lo que hace falta es agregarle reflexión: no para torturarte con lo que salió mal, sino para extraer la información que ese intento produjo y que todavía no has usado.',
    microAction: 'Piensa en algo que has intentado más de una vez sin el resultado que esperabas. Escribe — en tres líneas — qué crees que pasó realmente. Las tres líneas más honestas que puedas escribir sobre qué falló. Después pregúntate qué harías diferente si lo intentaras esta semana.',
  },
  '5A': {
    key: '5A',
    name: 'El que espera el momento',
    variant: 'El que mira afuera',
    pattern: 'Las razones por las que todavía no es el momento siempre están afuera. El trabajo, la economía, la pareja, el país, la temporada. No son inventadas — hay algo real en cada una. El problema no es que las circunstancias no importen. Es que se han convertido en el lugar permanente donde vive la explicación de por qué nada ha cambiado.',
    cost: 'La sensación de agencia sobre tu propia vida. Cuando la explicación siempre es externa, la capacidad de cambiar algo también se siente externa. No es solo que los proyectos no avancen. Es que la convicción de que puedes moverlos se va desgastando con cada espera.',
    strengths: 'Tienes una capacidad de lectura del contexto que mucha gente no tiene. Ves cómo las circunstancias afectan los resultados, anticipas riesgos, entiendes que el momento sí importa. Eso no es un defecto — es información valiosa cuando está al servicio de decidir cuándo moverse, no de justificar por qué no moverse.',
    microAction: 'Elige algo que llevas esperando que el contexto resuelva para poder empezar. Pregúntate: si las circunstancias externas no cambiaran en los próximos seis meses, ¿qué harías diferente? Escribe una respuesta honesta. Después elige una parte de esa respuesta y hazla esta semana.',
  },
  '5B': {
    key: '5B',
    name: 'El que espera el momento',
    variant: 'El que mira demasiado adentro',
    pattern: 'Tienes conciencia de que lo que ocurre afuera tiene algo que ver con lo que hay adentro. Eso es real y es más de lo que mucha gente llega a ver. El problema es que esa conciencia se convirtió en un requisito de entrada: antes de moverte, necesitas entenderte completamente. El autoconocimiento, que debería ser herramienta, se volvió condición.',
    cost: 'Momentos concretos en los que el entendimiento estaba suficientemente maduro para actuar — pero la acción no llegó porque siempre faltaba una capa más de comprensión. También ha costado la energía que va al análisis y que no llega al movimiento. Entenderte mejor no ha producido todavía los cambios que esperabas que produciría.',
    strengths: 'Tu capacidad de introspección es genuina y valiosa. Ves cosas de ti mismo que la mayoría evita mirar. Eso en el contexto correcto — al servicio de la acción — produce un nivel de consciencia en lo que haces que muy poca gente tiene. El problema no es que te conozcas demasiado. Es que el conocimiento no ha encontrado todavía su traducción en pasos concretos.',
    microAction: 'Elige algo que llevas procesando internamente sin que se haya convertido en un movimiento real. No lo analices más. Elige el paso más pequeño posible que puedas dar esta semana — sin necesitar más claridad de la que ya tienes — y hazlo.',
  },
  '6A': {
    key: '6A',
    name: 'El equilibrista',
    variant: 'El que necesita que todo esté quieto',
    pattern: 'Antes de empezar algo nuevo, necesitas que lo actual esté resuelto. Que las finanzas estén estables, que la relación esté tranquila, que el trabajo no esté en punto crítico. Hay lógica en eso — no es caprichoso. Pero esa lógica tiene un costo invisible: que nunca todo está quieto al mismo tiempo, y entonces nunca hay un momento limpio para empezar.',
    cost: 'Versiones de ti que podrían existir ya. Proyectos que estaban listos hace tiempo pero que cedieron su turno a lo que había que resolver primero. Y la sensación acumulada de que la vida siempre tiene algo que atender antes de que puedas atenderte tú.',
    strengths: 'Tienes una sensibilidad al contexto que te permite leer cuándo un momento es propicio y cuándo no. Eso cuando está bien calibrado es una ventaja real. El problema es que el umbral de "momento correcto" se ha ido subiendo solo, y lo que antes requería 70% de estabilidad ahora requiere 95% — que nunca llega.',
    microAction: 'Identifica algo que llevas esperando que el resto de tu vida te deje espacio para hacer. Ahora pregúntate: ¿qué sería lo mínimo que necesitarías para empezar — no para terminarlo, solo para empezarlo? Si la respuesta es menor de lo que creías, empieza esta semana.',
  },
  '6B': {
    key: '6B',
    name: 'El equilibrista',
    variant: 'El que normalizó el caos',
    pattern: 'En algún punto dejó de sentirse como señal. La urgencia de siempre, el modo apaga-incendios, la agenda que nunca tiene espacio — se convirtieron en el ritmo normal. No hay parálisis visible. Hay movimiento constante. Pero es un movimiento que responde a lo que llega, no que construye lo que quieres. Lo que importa de verdad nunca tiene turno porque el caos siempre tiene prioridad.',
    cost: 'No se siente como pérdida porque siempre hay algo que atender. Pero si miras hacia atrás en el último año y buscas lo que construiste — no lo que resolviste, sino lo que construiste intencionalmente — el balance dice algo. El movimiento ha sido real. La dirección, no siempre.',
    strengths: 'Tu capacidad de operar bajo presión es genuina. Funcionar en contextos exigentes, resolver lo que llega, sostener múltiples frentes — no todo el mundo puede. El problema no es que seas reactivo. Es que la reactividad se quedó como modo permanente cuando debería ser una herramienta ocasional.',
    microAction: 'Bloquea 45 minutos en tu agenda esta semana — no para resolver algo urgente, sino para hacer una sola cosa que hayas estado posponiendo porque siempre hay algo más importante. Trátalo como una reunión que no puedes cancelar.',
  },
  '7A': {
    key: '7A',
    name: 'El eterno planificador',
    variant: 'El arquitecto sin obra',
    pattern: 'El plan existe. En versiones, con detalle, con etapas claras. Cada revisión mejora la anterior y justifica esperar un poco más antes de ejecutar. Hay una satisfacción genuina en planear bien — una sensación de control, de haber resuelto algo. Lo que cuesta ver es que esa satisfacción puede consumir exactamente la energía que necesitaba el primer paso concreto.',
    cost: 'La única información que un plan no puede darte: lo que pasa cuando lo ejecutas. Cada versión nueva del plan es una versión más de algo que todavía no ha tenido contacto con la realidad. Y la realidad siempre tiene algo que decir que ninguna versión del plan pudo anticipar. Eso solo se sabe haciendo.',
    strengths: 'Cuando finalmente ejecutas, llegas con una claridad estructural que la mayoría no tiene. Sabes para dónde vas, sabes qué necesitas, sabes cómo medir si está funcionando. Eso en movimiento es una ventaja real. El problema no es la calidad del plan. Es que el plan lleva esperando demasiado tiempo su primer contacto con la vida.',
    microAction: 'Elige una parte del plan — la más pequeña, la más concreta — y ejecútala esta semana sin revisarla más. No el plan completo. Una sola pieza que pueda existir en la realidad antes del viernes. El objetivo no es que salga perfecta. Es que salga.',
  },
  '7B': {
    key: '7B',
    name: 'El eterno planificador',
    variant: 'El que empieza todo',
    pattern: 'El primer paso no es el problema. Arrancas con energía, con convicción, con claridad sobre para dónde vas. Pero en algún punto del camino aparece algo — una idea que parece mejor, un enfoque diferente, una oportunidad que se siente más urgente — y lo que estaba en marcha queda a medias. El historial no es de parálisis sino de proyectos inconclusos que se acumulan.',
    cost: 'La credibilidad de tus propios inicios. Cuando sabes que hay un patrón de no terminar, cada nuevo comienzo viene con una duda silenciosa sobre si esta vez va a ser diferente. También ha costado los resultados que solo existen al final del proceso — porque los más valiosos casi nunca están en el primer tramo del camino.',
    strengths: 'Tu capacidad de arrancar, de generar energía al inicio, de convocar entusiasmo propio y ajeno — es real y es escasa. Mucha gente no puede empezar. Tú sí puedes. Lo que falta no es más motivación para iniciar sino una estructura que te sostenga cuando aparece lo nuevo y brillante que quiere desplazar lo que ya está en marcha.',
    microAction: 'Revisa qué tienes empezado y sin terminar. Elige uno — solo uno. No el más emocionante, sino el más cercano a estar terminado. Dedícale tiempo esta semana sin abrir nada nuevo en paralelo. El objetivo es un aterrizaje, no un nuevo despegue.',
  },
}
