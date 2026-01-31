import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Save, X, User as UserIcon, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { HomeSidebar } from '../home/HomeSidebar';
import { useAuth } from '../../store/useAuth';
import Header from '../../components/shared/Header';

// Helper to get API URL
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string') {
        return envUrl.replace(/\/$/, '');
    }
    return 'http://localhost:3000'; // Fallback
};

const API_URL = getApiUrl();

interface ProfileData {
    firstName: string;
    lastName: string;
    whatsapp: string;
    fecha_nacimiento: string;
    pais_residencia: string;
    ciudad_residencia: string;
    email: string;
    username: string;
    preferredName: string;
}

export default function Perfil() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initial state matching the requested fields
    const [formData, setFormData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        whatsapp: '',
        fecha_nacimiento: '',
        pais_residencia: '',
        ciudad_residencia: '',
        email: '',
        username: '',
        preferredName: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_URL}/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Perfil data fetched:", data); // DEBUG LOG

                // Format date for input field (YYYY-MM-DD)
                let formattedDate = '';
                if (data.fecha_nacimiento) {
                    formattedDate = new Date(data.fecha_nacimiento).toISOString().split('T')[0];
                }

                const newData = {
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    whatsapp: data.whatsapp || '',
                    fecha_nacimiento: formattedDate,
                    pais_residencia: data.pais_residencia || '',
                    ciudad_residencia: data.ciudad_residencia || '',
                    email: data.email || '',
                    username: data.username || '',
                    preferredName: data.preferredName || ''
                };
                console.log("Setting form data:", newData); // DEBUG LOG

                setFormData(newData);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setIsEditing(false);
                // Update global user state if needed, though useAuth might need a refresh logic
                // For now, we rely on the fact that we just fetched the updated data or have it in state
                // Optionally update local storage user if useAuth relies on it
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchProfile(); // Revert changes
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-white font-sans overflow-hidden">
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Perfil" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6 md:p-12">

                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center text-slate-400 text-sm mb-2 hover:text-slate-600 transition-colors group"
                            >
                                <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                Dashboard
                            </button>
                            <h2 className="text-3xl font-light text-slate-800">Mi Perfil</h2>
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm hover:shadow active:scale-95"
                            >
                                <Edit2 size={14} />
                                Editar Perfil
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
                                    disabled={saving}
                                >
                                    <X size={14} />
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-emerald-500/25 active:scale-95 disabled:opacity-70"
                                    disabled={saving}
                                >
                                    <Save size={14} />
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                            {/* Avatar & Main Info */}
                            <div className="bg-slate-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/10">
                                        {formData.firstName?.[0] || formData.username?.[1] || 'U'}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-2xl font-bold mb-1">
                                            {formData.preferredName || (formData.firstName && formData.lastName
                                                ? `${formData.firstName} ${formData.lastName}`
                                                : formData.username || 'Usuario')}
                                        </h3>
                                        <p className="text-emerald-400 font-medium text-sm mb-4">{user?.email}</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                            {/* <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm border border-white/10">
                                                Viajero
                                            </span> */}
                                            {formData.ciudad_residencia && (
                                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1">
                                                    <MapPin size={10} />
                                                    {formData.ciudad_residencia}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pl-1">Información Personal</h4>
                                </div>
                                <Field
                                    label="¿Cómo te gusta que te llamen?"
                                    name="preferredName"
                                    value={formData.preferredName}
                                    icon={UserIcon}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <Field
                                    label="Nombre"
                                    name="firstName"
                                    value={formData.firstName}
                                    icon={UserIcon}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <Field
                                    label="Apellido"
                                    name="lastName"
                                    value={formData.lastName}
                                    icon={UserIcon}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />

                                <Field
                                    label="WhatsApp"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    icon={Phone}
                                    type="tel"
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <Field
                                    label="Fecha de Nacimiento"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    icon={Calendar}
                                    type="date"
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />

                                <div className="md:col-span-2 mt-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pl-1">Ubicación</h4>
                                </div>

                                <Field
                                    label="País de Residencia"
                                    name="pais_residencia"
                                    value={formData.pais_residencia}
                                    icon={MapPin}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />
                                <Field
                                    label="Ciudad de Residencia"
                                    name="ciudad_residencia"
                                    value={formData.ciudad_residencia}
                                    icon={MapPin}
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Reusable component moved outside
const Field = ({
    label,
    name,
    type = "text",
    icon: Icon,
    value,
    isEditing,
    onChange
}: {
    label: string,
    name: keyof ProfileData,
    type?: string,
    icon: any,
    value: string,
    isEditing: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 transition-all hover:border-slate-200">
        <div className="flex items-start gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {label}
                </label>
                {isEditing ? (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        placeholder={`Ingresa tu ${label.toLowerCase()}`}
                    />
                ) : (
                    <p className="text-slate-800 font-medium text-sm min-h-[24px] flex items-center">
                        {value || <span className="text-slate-300 italic">No especificado</span>}
                    </p>
                )}
            </div>
        </div>
    </div>
);

