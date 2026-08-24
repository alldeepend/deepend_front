export type Testimonial = {
  name: string
  role: string
  text: string
  img: string
  audio: string
  color: string
}

export const testimonials: Testimonial[] = [
  {
    name: 'Liliana Abril',
    role: 'Usuaria DeepEnd',
    text: 'Para mí, DeepEnd significa un lugar donde podemos aprender, crecer y llegar cada vez más lejos.',
    img: '/Imagen_Testimonio.jpg',
    audio: '/audio/testimonials/liliana-abril.mp3',
    color: '#52B788',
  },
  {
    name: 'Cata Montoya',
    role: 'Usuaria DeepEnd',
    text: 'Después de todo este tiempo me he dado cuenta que la comunidad me ha entregado más a mí, están pendientes, te impulsan...',
    img: '/Imagen_Testimonio.jpg',     // reemplazar con foto real
    audio: '/audio/testimonials/cata-montoya.mp3',
    color: '#3FC6D8',
  },
  {
    name: 'Catalina Díaz',
    role: 'Usuaria DeepEnd',
    text: 'Pasamos mucho tiempo en piloto automático, sobreviviendo al caos que puede generar la rutina, pero para eso está DeepEnd.',
    img: '/Imagen_Testimonio.jpg',     // reemplazar con foto real
    audio: '/audio/testimonials/catalina-diaz.mp3',
    color: '#B57BEE',
  },
  {
    name: 'Liliana Moreno',
    role: 'Usuaria DeepEnd',
    text: 'Gracias a DeepEnd aprendí que lo importante no son los minutos acumulados, sino cumplir mi palabra y avanzar incluso en los días difíciles.',
    img: '/Imagen_Testimonio.jpg',     // reemplazar con foto real
    audio: '/audio/testimonials/liliana-moreno.mp3',
    color: '#F4669B',
  },
  {
    name: 'Susana Panqueva',
    role: 'Usuaria DeepEnd',
    text: 'Me parece muy bonito crecer en comunidad, con ayuda, con amor, y qué mejor que de la mano de la tribu.',
    img: '/Imagen_Testimonio.jpg',     // reemplazar con foto real
    audio: '/audio/testimonials/susana-panqueva.mp3',
    color: '#5B9BF7',
  },
  {
    name: 'Paola Vargas',
    role: 'Usuaria DeepEnd',
    text: 'Para mí, DeepEnd ha sido una comunidad que me ayudó en momentos difíciles y me acercó a gente que hoy considero mis amigos.',
    img: '/Imagen_Testimonio.jpg',     // reemplazar con foto real
    audio: '/audio/testimonials/paola-vargas.mp3',
    color: '#E8C547',
  },
]
