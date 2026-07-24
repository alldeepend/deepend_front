import React, { useState, useEffect } from 'react';
import { Phone, Loader2, Eye, EyeOff, ChevronDown, Check, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useLocation, useNavigate } from 'react-router';
import { COUNTRY_CODES } from '../utils/countryCodes';
import { userApi } from '../services/user';
import { C } from '../styles/colors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// --- OPTIONS LISTS ---

const DOCUMENT_TYPES = ["CC", "CE", "Pasaporte", "NIT"];
const GENDERS = ["Femenino", "Masculino", "Otro", "Prefiero no decirlo"];
const CIVIL_STATUSES = ["Solter@", "Casad@", "Union Libre", "Divorciad@", "Viud@"];
const LABOR_STATUSES = ["Emplead@", "Independiente", "Desemplead@", "Estudiante", "Jubilad@", "Hogar"];
const EDUCATION_LEVELS = ["Primaria", "Bachiller", "Técnico", "Tecnólogo", "Universitario Incompleto", "Universitario Completo", "Posgrado"];
const INCOME_RANGES = ["Menos de 500 USD", "500 - 1.000 USD", "1.000 - 2.500 USD", "Mas de 2.600 USD"];
const CURRENCIES = ["COP", "USD", "EUR", "MXN"];
const DEPENDENT_RELATIONSHIPS = ["Hij@(s)", "Padres", "Abuelos", "Hermanos", "Conyuge", "Otros"];
const SOCIAL_PLATFORMS = ["Instagram", "Facebook", "TikTok", "X (Twitter)", "LinkedIn", "YouTube", "Website"];

export default function RegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  // const selectedCategories = location.state?.categories || []; // REMOVED: Legacy logic
  const { setUser } = useAuth();

  // --- STEPS MANAGEMENT ---
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    // Basic / Account
    email: '',
    password: '',
    confirmPassword: '',
    // Personal
    name: '',
    firstName: '',
    lastName: '',
    preferredName: '',

    tipo_documento: 'CC',
    documento_identidad: '',
    fecha_nacimiento: '',
    genero: '',
    estado_civil: '',

    // Contact / Location
    pais_residencia: 'Colombia',
    ciudad_residencia: '',
    estado_residencia: '', // Departamento/Estado
    direccion_residencia: '',
    codigo_postal: '',
    telefono: '', // Full phone string or just number part? We'll combine

    // Socio-economic
    estatus_laboral: '',
    nivel_educativo_actual: '',
    rango_ingreso_mensual: '',
    ingreso_mensual_hogar: '', // number
    moneda_ingreso: 'USD',
    dependientes_economicos: 0,
    parentesco_dependientes: [] as string[],

    // Social Media
    redes_sociales: {
      platforms: [] as string[],
      // dynamic keys will be added here
    } as any
  });

  // Phone specifically
  const [countryCode, setCountryCode] = useState('+57');
  const [phoneNumber, setPhoneNumber] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HANDLERS ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Multi-select handler for Parentesco
  const toggleParentesco = (value: string) => {
    setFormData(prev => {
      const current = prev.parentesco_dependientes || [];
      if (current.includes(value)) {
        return { ...prev, parentesco_dependientes: current.filter(item => item !== value) };
      } else {
        return { ...prev, parentesco_dependientes: [...current, value] };
      }
    });
  };

  // Social Media Handlers
  const toggleSocialPlatform = (platform: string) => {
    setFormData(prev => {
      const currentPlatforms = prev.redes_sociales.platforms || [];
      const isSelected = currentPlatforms.includes(platform);

      let newPlatforms;
      let newSocials = { ...prev.redes_sociales };

      if (isSelected) {
        newPlatforms = currentPlatforms.filter((p: string) => p !== platform);
        delete newSocials[platform]; // Remove the username field if deselected
      } else {
        newPlatforms = [...currentPlatforms, platform];
        newSocials[platform] = ''; // Initialize empty username
      }

      return {
        ...prev,
        redes_sociales: {
          ...newSocials,
          platforms: newPlatforms
        }
      };
    });
  };

  const handleSocialUsernameChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      redes_sociales: {
        ...prev.redes_sociales,
        [platform]: value
      }
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    // Final Validation
    if (formData.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (formData.password !== formData.confirmPassword) return setError('Las contraseñas no coinciden.');

    setLoading(true);
    setError('');

    try {
      const fullPhone = `${countryCode}${phoneNumber}`;

      const payload = {
        ...formData,
        whatsapp: fullPhone,
        telefono: fullPhone,
        name: `${formData.firstName} ${formData.lastName}`, // Composite name
        // categories: selectedCategories, // REMOVED: Legacy logic
        ingreso_mensual_hogar: formData.ingreso_mensual_hogar ? parseFloat(formData.ingreso_mensual_hogar.toString()) : 0,
        dependientes_economicos: parseInt(formData.dependientes_economicos.toString() || '0'),
        // redes_sociales is already in correct format
      };

      const result = await userApi.register(payload);

      if (result.success) {
        setUser(result.user);
        navigate('/dashboard');
      } else {
        // @ts-ignore
        setError(result.error || 'Error al registrar. Revisa los datos.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const nextStepDisabled = () => {
    // Basic validation per step
    if (step === 1) {
      return !formData.firstName || !formData.lastName || !formData.email || !formData.password || formData.password !== formData.confirmPassword;
    }
    if (step === 2) {
      return !formData.tipo_documento || !formData.documento_identidad || !formData.fecha_nacimiento || !formData.pais_residencia || !phoneNumber;
    }
    // Add more strict validation if needed
    return false;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-montserrat" style={{ background: C.bg }}>
      <div className="p-8 rounded-4xl shadow-xl w-full max-w-2xl border relative overflow-hidden flex flex-col max-h-[90vh]" style={{ background: C.surface1, borderColor: C.border }}>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-black to-accent-green"></div>

        <div className="text-center mb-6 shrink-0">
          <h2 className="font-american text-3xl font-bold" style={{ color: C.text }}>Registro - Paso {step}/{TOTAL_STEPS}</h2>
          <p className="mt-1 text-sm" style={{ color: C.textMuted }}>Completa tu perfil para una mejor experiencia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl text-center animate-shake sticky top-0 z-10">
              {error}
            </div>
          )}

          {/* --- STEP 1: ACCOUNT & BASIC INFO --- */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col md:flex-row gap-4">
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nombre(s)" required className="w-full md:w-1/2 border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apellidos" required className="w-full md:w-1/2 border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
              </div>
              <input name="preferredName" value={formData.preferredName} onChange={handleChange} placeholder="¿Cómo te gusta que te llamen?" className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />

              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Correo electrónico" required className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />

              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: C.label }}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>

              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmar Contraseña" required className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: C.label }}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
          )}

          {/* --- STEP 2: PERSONAL & LOCATION --- */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className="border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }}>
                  {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input name="documento_identidad" value={formData.documento_identidad} onChange={handleChange} placeholder="No. Documento" className="border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs ml-2" style={{ color: C.textMuted }}>Fecha Nacimiento</label>
                  <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
                </div>
                <div>
                  <label className="text-xs ml-2" style={{ color: C.textMuted }}>Género</label>
                  <select name="genero" value={formData.genero} onChange={handleChange} className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }}>
                    <option value="">Seleccionar...</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <select name="estado_civil" value={formData.estado_civil} onChange={handleChange} className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }}>
                <option value="">Estado Civil...</option>
                {CIVIL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <div className="h-px my-2" style={{ background: C.border }}></div>

              {/* Country & Phone */}
              <div className="flex gap-2">
                <div className="relative w-1/3">
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-full border-0 rounded-xl pl-2 pr-6 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-accent-green text-sm transition-all" style={{ background: C.surface2, color: C.text }}>
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.label }} />
                </div>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="Teléfono / WhatsApp" className="w-2/3 border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="pais_residencia" value={formData.pais_residencia} onChange={handleChange} placeholder="País" className="border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
                <input name="estado_residencia" value={formData.estado_residencia} onChange={handleChange} placeholder="Departamento/Estado" className="border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="ciudad_residencia" value={formData.ciudad_residencia} onChange={handleChange} placeholder="Ciudad" className="border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
                <input name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} placeholder="Código Postal" className="border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
              </div>
              <input name="direccion_residencia" value={formData.direccion_residencia} onChange={handleChange} placeholder="Dirección Completa" className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
            </div>
          )}

          {/* --- STEP 3: SOCIO-ECONOMIC --- */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <select name="estatus_laboral" value={formData.estatus_laboral} onChange={handleChange} className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }}>
                <option value="">Estatus Laboral...</option>
                {LABOR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select name="nivel_educativo_actual" value={formData.nivel_educativo_actual} onChange={handleChange} className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }}>
                <option value="">Nivel Educativo...</option>
                {EDUCATION_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs ml-2" style={{ color: C.textMuted }}>Ingreso Mensual Hogar</label>
                  <input type="number" name="ingreso_mensual_hogar" value={formData.ingreso_mensual_hogar} onChange={handleChange} placeholder="0.00" className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }} />
                </div>
                <div>
                  <label className="text-xs ml-2" style={{ color: C.textMuted }}>Moneda</label>
                  <select name="moneda_ingreso" value={formData.moneda_ingreso} onChange={handleChange} className="w-full border-0 rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green text-center transition-all" style={{ background: C.surface2, color: C.text }}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <select name="rango_ingreso_mensual" value={formData.rango_ingreso_mensual} onChange={handleChange} className="w-full border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green transition-all" style={{ background: C.surface2, color: C.text }}>
                <option value="">Rango Ingreso (Ref)...</option>
                {INCOME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <div className="h-px my-2" style={{ background: C.border }}></div>

              <div className="flex gap-4 items-center">
                <label className="text-sm w-1/2" style={{ color: C.textSec }}>Dependientes Económicos:</label>
                <input type="number" name="dependientes_economicos" value={formData.dependientes_economicos} onChange={handleChange} min="0" className="w-20 border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-green text-center transition-all" style={{ background: C.surface2, color: C.text }} />
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: C.textSec }}>Parentesco Dependientes (Selección Múltiple):</label>
                <div className="flex flex-wrap gap-2">
                  {DEPENDENT_RELATIONSHIPS.map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => toggleParentesco(rel)}
                      className="px-3 py-1.5 rounded-full text-xs transition-all border"
                      style={formData.parentesco_dependientes.includes(rel)
                        ? { background: C.forest, borderColor: C.green, color: C.green, fontWeight: 700 }
                        : { background: C.surface2, borderColor: C.border, color: C.textMuted }}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 4: SOCIAL MEDIA --- */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-sm mb-3 font-medium" style={{ color: C.textSec }}>Selecciona tus Redes Sociales:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SOCIAL_PLATFORMS.map(platform => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => toggleSocialPlatform(platform)}
                      className="flex items-center justify-center p-3 rounded-xl border transition-all"
                      style={formData.redes_sociales.platforms?.includes(platform)
                        ? { background: C.forest, borderColor: C.green, color: C.green }
                        : { background: C.surface1, borderColor: C.border, color: C.textMuted }}
                    >
                      <span className="text-sm font-medium">{platform}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.redes_sociales.platforms?.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl" style={{ background: C.surface2 }}>
                  <p className="text-xs uppercase font-bold tracking-wider mb-2" style={{ color: C.label }}>Ingresa tu usuario / link</p>
                  {formData.redes_sociales.platforms.map((platform: string) => (
                    <div key={platform} className="flex gap-2 items-center">
                      <div className="w-24 shrink-0 text-xs font-semibold truncate" style={{ color: C.textSec }}>{platform}</div>
                      <input
                        type="text"
                        value={formData.redes_sociales[platform] || ''}
                        onChange={(e) => handleSocialUsernameChange(platform, e.target.value)}
                        placeholder={`Usuario de ${platform}`}
                        className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-green"
                        style={{ background: C.surface1, borderColor: C.border, color: C.text, border: `1px solid ${C.border}` }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </form>

        {/* --- FOOTER BUTTONS --- */}
        <div className="mt-6 pt-4 border-t flex justify-between items-center shrink-0" style={{ borderColor: C.border }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: C.textMuted }}
            >
              Atrás
            </button>
          ) : (
            <div /> // Spacer
          )}

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || nextStepDisabled()}
            className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2"
            style={loading || nextStepDisabled()
              ? { background: C.disabled, cursor: 'not-allowed' }
              : { background: 'var(--color-accent-green, #52B788)', cursor: 'pointer' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {step < TOTAL_STEPS ? 'Siguiente' : 'Finalizar Registro'}
          </button>
        </div>
      </div>
    </div>
  );
}