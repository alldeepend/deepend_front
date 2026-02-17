
import React, { useState } from 'react';
import { X, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../store/useAuth';

interface FinanceDisclaimerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    onReject: () => void;
}

const FinanceDisclaimerModal = ({ isOpen, onClose, onAccept, onReject }: FinanceDisclaimerModalProps) => {
    const [isChecked, setIsChecked] = useState(false);
    const { user } = useAuth();

    if (!isOpen) return null;

    const handleAccept = () => {
        if (!isChecked) return;
        onAccept();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative border border-slate-200">

                {/* Header */}
                <div className="bg-slate-900 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-white w-6 h-6" />
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                            Declaración de Responsabilidad - Finanzas
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-sm text-slate-600 leading-relaxed shadow-sm">
                        <p className="font-bold text-slate-800 mb-2">DeepEnd S.A.S., sociedad constituida bajo las leyes de la República de Colombia, informa que:</p>

                        <ol className="list-decimal pl-5 space-y-4 marker:font-bold marker:text-slate-400">
                            <li className="pl-2">
                                <strong className="block text-slate-800 mb-1">No prestamos asesoría financiera ni recomendaciones de inversión personalizadas.</strong>
                                Los ejercicios, retos y dinámicas ofrecidos en la plataforma, presentaciones y espacios de interacción de DeepEnd tienen un carácter lúdico, educativo y de simulación, y no deben interpretarse como asesoría profesional, sugerencia, oferta, invitación o recomendación para realizar inversiones específicas.
                            </li>
                            <li className="pl-2">
                                <strong className="block text-slate-800 mb-1">No realizamos recaudo ni captación de dinero.</strong>
                                DeepEnd no recibe, administra ni gestiona recursos económicos de los participantes, ni intermedia en la colocación de valores o productos financieros de terceros.
                            </li>
                            <li className="pl-2">
                                <strong className="block text-slate-800 mb-1">La decisión es personal e independiente.</strong>
                                Toda decisión de ahorro, inversión o uso de recursos corresponde única y exclusivamente al usuario o participante, bajo su propia autonomía y responsabilidad. El hecho de participar en los retos no implica obligación alguna de ejecutar dichas acciones en la vida real.
                            </li>
                            <li className="pl-2">
                                <strong className="block text-slate-800 mb-1">Aliados verificados, pero relación directa.</strong>
                                En caso de que el participante decida contratar productos o servicios financieros con empresas aliadas, la relación contractual, legal y económica será directamente entre el usuario y la entidad aliada. DeepEnd no es parte de dicha transacción y, por lo tanto, no asume responsabilidad alguna frente a la calidad, rendimientos, riesgos, cumplimiento o resultado de las operaciones realizadas con terceros.
                            </li>
                            <li className="pl-2">
                                <strong className="block text-slate-800 mb-1">Limitación de responsabilidad.</strong>
                                DeepEnd no será responsable, en ningún caso, por pérdidas, daños o perjuicios derivados de las decisiones de los participantes, ni por los resultados de inversiones, aun cuando estas se realicen con aliados verificados y presentados en la plataforma. Toda inversión conlleva riesgo, incluyendo la posible pérdida parcial o total del capital invertido.
                            </li>
                            <li className="pl-2">
                                <strong className="block text-slate-800 mb-1">Aplicación internacional.</strong>
                                Este disclaimer aplica a todos los usuarios, independientemente de su país de residencia. Se recuerda que la regulación financiera puede variar en cada jurisdicción; es responsabilidad del participante informarse y actuar conforme a las normas de su país.
                            </li>
                            <li className="pl-2">
                                <strong className="block text-slate-800 mb-1">Aceptación del disclaimer.</strong>
                                Al participar en los retos, actividades, dinámicas o procesos de simulación ofrecidos por DeepEnd, el usuario manifiesta que ha leído, comprendido y aceptado este disclaimer, liberando a DeepEnd de cualquier responsabilidad derivada de las decisiones que adopte en su esfera personal, financiera o patrimonial.
                            </li>
                            <li className="pl-2">
                                <strong className="block text-slate-800 mb-1">Aspectos tributarios.</strong>
                                DeepEnd no presta asesoría tributaria ni garantiza beneficios fiscales. Cada usuario es responsable de verificar, declarar y cumplir con sus obligaciones fiscales en su país de residencia. En Colombia, el manejo de inversiones y rentas está sujeto a lo dispuesto por la dirección de Impuestos y Aduanas Nacionales (DIAN) y demás normas vigentes.
                            </li>
                        </ol>

                        <div className="mt-6 bg-slate-200/50 p-4 rounded-lg border border-slate-300">
                            <strong>Recomendamos contar con la asesoría de un profesional tributario antes de tomar decisiones que puedan tener impacto fiscal (esto aplica para cualquier país).*</strong>
                            <div className="mt-2 text-xs italic text-slate-500">
                                **Debes marcar la casilla, en caso de no aceptarlo está bien y entenderemos que no es de tu interés participar en los retos financieros, por lo que serán bloqueados estos retos en tu plataforma. Una vez marcada la aceptación de la política, no podrás cambiar la respuesta, aunque es posible que puedas hacer la solicitud de que sí deseas aceptar y participar, nos puedes escribir al correo hola@alldeepend.com y hacer tu solicitud.
                            </div>
                        </div>
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-start gap-3 mb-8 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 transition-colors cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>
                            {isChecked && <Check size={14} className="text-white" />}
                        </div>
                        <div className="text-sm text-slate-700 select-none">
                            He leído, comprendo y acepto los términos y conditions descritos en el disclaimer anterior. Entiendo que mi participación en los retos de finanzas está sujeta a esta aceptación.
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t border-slate-100">
                        <button
                            onClick={onReject}
                            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm w-full sm:w-auto text-center"
                        >
                            NO ACEPTO
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={!isChecked}
                            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md text-sm w-full sm:w-auto flex items-center justify-center gap-2 ${isChecked
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <Check size={18} />
                            SI, ACEPTO
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FinanceDisclaimerModal;
