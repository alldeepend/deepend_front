import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { C } from '../../styles/colors';

const heading = { fontFamily: "'American Typewriter', Georgia, serif", color: C.text };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-base font-bold mb-3" style={{ color: C.text }}>{title}</h2>
            <div className="space-y-2.5">{children}</div>
        </section>
    );
}

export default function PrivacyPolicy() {
    return (
        <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
            <header className="sticky top-0 z-10 backdrop-blur border-b" style={{ background: C.bg + 'e6', borderColor: C.border }}>
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src="/pwa-512x512.png" alt="" className="w-8 h-8 rounded-full" />
                        <span className="text-base font-bold" style={heading}>
                            DeepEnd<span style={{ color: C.green }}>.</span>
                        </span>
                    </Link>
                    <Link to="/" className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80" style={{ color: C.label }}>
                        <ArrowLeft size={14} /> Volver
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-14">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: C.red }}>
                    Legal
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={heading}>
                    Política de Privacidad
                </h1>
                <p className="text-xs mb-12" style={{ color: C.label }}>
                    Fecha de última actualización: 5 de noviembre de 2025
                </p>

                <div className="space-y-9 text-sm leading-relaxed" style={{ color: C.textSec }}>
                    <p>
                        Bienvenido a DeepEnd. Su privacidad es de suma importancia para nosotros. Esta Política de Privacidad
                        describe cómo DeepEnd (en adelante, "nosotros", "nuestro" o "DeepEnd") recopila, usa, comparte y
                        protege su información personal cuando utiliza nuestros servicios.
                    </p>

                    <Section title="Información que Recopilamos">
                        <p>
                            Recopilamos información sobre usted de varias maneras cuando utiliza nuestros servicios. Esto
                            puede incluir:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li><b style={{ color: C.text }}>Información de Identificación Personal:</b> Como su nombre, dirección de correo electrónico, número de teléfono y dirección postal.</li>
                            <li><b style={{ color: C.text }}>Información de Comunicación:</b> Recopilamos el contenido de los mensajes, consultas de soporte y cualquier otra comunicación que nos envíe, incluyendo las comunicaciones a través de plataformas de mensajería de terceros.</li>
                            <li><b style={{ color: C.text }}>Información de Uso:</b> Información sobre cómo interactúa con nuestros servicios, como su dirección IP, tipo de navegador y páginas visitadas.</li>
                        </ul>
                    </Section>

                    <Section title="Cómo Usamos su Información">
                        <p>Usamos la información que recopilamos para diversos fines, que incluyen:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Proveer, operar y mantener nuestros servicios.</li>
                            <li>Procesar sus transacciones y gestionar sus pedidos.</li>
                            <li>Mejorar, personalizar y expandir nuestros servicios.</li>
                            <li>Comunicarnos con usted, incluso para servicio al cliente, para proporcionarle actualizaciones y otra información relacionada con el servicio, y con fines de marketing y promoción (siempre con su consentimiento previo cuando sea requerido).</li>
                            <li>Cumplir con nuestras obligaciones legales y prevenir el fraude.</li>
                        </ul>
                    </Section>

                    <Section title="Cómo Compartimos su Información (Sección Clave para Meta)">
                        <p>
                            No compartimos su información personal con terceros, excepto en las circunstancias que se
                            describen a continuación:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li><b style={{ color: C.text }}>Proveedores de Servicios:</b> Podemos compartir su información con proveedores externos que realizan servicios en nuestro nombre, como procesamiento de pagos, análisis de datos, entre otros.</li>
                            <li>
                                <b style={{ color: C.text }}>Comunicaciones a través de WhatsApp:</b> Para comunicarnos con usted a través de WhatsApp, utilizamos
                                la Interfaz de Programación de Aplicaciones (API) de WhatsApp Business, un servicio proporcionado
                                por Meta Platforms, Inc. (en adelante, "Meta"). Al comunicarse con DeepEnd a través de WhatsApp,
                                usted entiende que Meta actúa como un proveedor de servicios (o 'procesador de datos') para
                                transmitir sus mensajes. El manejo de sus datos por parte de Meta también está sujeto a su
                                propia política de privacidad.
                            </li>
                            <li><b style={{ color: C.text }}>Cumplimiento Legal:</b> Podemos divulgar su información si así lo exige la ley o en respuesta a solicitudes válidas de las autoridades públicas.</li>
                        </ul>
                    </Section>

                    <Section title="Seguridad de sus Datos">
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas para proteger la seguridad de su
                            información personal. Sin embargo, ningún sistema de transmisión por Internet o de almacenamiento
                            electrónico es 100% seguro.
                        </p>
                    </Section>

                    <Section title="Sus Derechos de Privacidad">
                        <p>
                            Dependiendo de su ubicación, usted puede tener ciertos derechos con respecto a su información
                            personal, que incluyen:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>El derecho a acceder, corregir o eliminar la información personal que tenemos sobre usted.</li>
                            <li>El derecho a oponerse o restringir cierto procesamiento de datos.</li>
                            <li>El derecho a la portabilidad de los datos.</li>
                            <li>El derecho a retirar el consentimiento en cualquier momento.</li>
                        </ul>
        
                    </Section>

                    <Section title="Cambios a esta Política de Privacidad">
                        <p>
                            Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier
                            cambio publicando la nueva Política de Privacidad en esta página y actualizando la "Fecha de
                            última actualización" en la parte superior.
                        </p>
                    </Section>

                    <Section title="Contáctenos">
                        <p>Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos:</p>
                        <p>
                            DeepEnd<br />
                            hola@alldeepend.com
                        </p>
                    </Section>
                </div>
            </main>
        </div>
    );
}
