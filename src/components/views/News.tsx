import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, X, Newspaper } from 'lucide-react';
import { HomeSidebar } from '../home/HomeSidebar';
import Header from '../shared/Header';
import { PhotoUploadField } from './worlds/EvidenceFields';
import WorldsRightSidebar, { earnedBadgesFromAreas, totalXpFromAreas } from './worlds/WorldsRightSidebar';
import { useAuth } from '../../store/useAuth';
import { C } from '../../styles/colors';
import { newsApi, type NewsItem } from '../../services/news';
import { journeyApi } from '../../services/journey';
import type { Area } from '../../types/journey';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

function CreateNewsModal({ onClose, onCreated }: { onClose: () => void; onCreated: (news: NewsItem) => void }) {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const canSubmit = title.trim().length > 0 && text.trim().length > 0 && !saving;

    async function handleSubmit() {
        if (!canSubmit) return;
        setSaving(true);
        try {
            const { news } = await newsApi.createNews({ title: title.trim(), text: text.trim(), imageUrl });
            onCreated(news);
            onClose();
        } catch {
            alert('No se pudo crear la noticia. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(35,31,32,0.85)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto dark-scrollbar"
                style={{ background: C.surface1, border: `1px solid ${C.border}` }}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                        Crear noticia
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-lg" style={{ color: C.textMuted }}>
                        <X size={18} />
                    </button>
                </div>

                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: C.label }}>
                        Título
                    </label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Título de la noticia"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                        style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: C.label }}>
                        Texto
                    </label>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        rows={5}
                        placeholder="Escribe el contenido de la noticia..."
                        className="w-full rounded-xl p-4 text-sm resize-none outline-none"
                        style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: C.label }}>
                        Imagen (opcional)
                    </label>
                    <PhotoUploadField
                        value={imageUrl}
                        onChange={setImageUrl}
                        disabled={saving}
                        uploadFn={newsApi.uploadImage}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                    style={{
                        background: canSubmit ? C.red : C.surface2,
                        color: canSubmit ? '#fff' : C.disabled,
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                    }}
                >
                    {saving ? 'Publicando...' : 'Publicar noticia'}
                </button>
            </div>
        </div>
    );
}

export default function News() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [areas, setAreas] = useState<Area[]>([]);

    useEffect(() => {
        newsApi.getNews()
            .then(res => setNews(res.news))
            .catch(() => setNews([]))
            .finally(() => setLoading(false));
        journeyApi.getAvailableJourneys()
            .then(d => setAreas(d.areas))
            .catch(() => setAreas([]));
    }, []);

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans overflow-hidden" style={{ background: C.bg }}>
            <div className="md:hidden w-full">
                <Header />
            </div>

            <HomeSidebar activeTab="Noticias" />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6 md:p-12">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center text-sm mb-2 transition-colors group"
                                    style={{ color: C.label }}
                                >
                                    <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                    Dashboard
                                </button>
                                <h2 className="text-3xl font-light" style={{ color: C.text }}>Noticias</h2>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                                    style={{ background: C.red, color: '#fff' }}
                                >
                                    <Plus size={16} /> Crear noticia
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${C.border} ${C.red} ${C.border} ${C.border}` }} />
                            </div>
                        ) : news.length === 0 ? (
                            <div
                                className="flex flex-col items-center text-center gap-3 rounded-2xl border p-12"
                                style={{ borderColor: C.border, borderStyle: 'dashed' }}
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C.surface2 }}>
                                    <Newspaper size={22} style={{ color: C.label }} />
                                </div>
                                <p className="text-sm" style={{ color: C.label }}>
                                    Todavía no hay noticias publicadas
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {news.map(item => (
                                    <article
                                        key={item.id}
                                        className="rounded-2xl border overflow-hidden"
                                        style={{ background: C.surface1, borderColor: C.border }}
                                    >
                                        {item.imageUrl && (
                                            <img src={item.imageUrl} alt="" className="w-full object-cover" style={{ maxHeight: '360px' }} />
                                        )}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-2" style={{ color: C.text, fontFamily: "'American Typewriter', Georgia, serif" }}>
                                                {item.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed whitespace-pre-line mb-4" style={{ color: C.textSec }}>
                                                {item.text}
                                            </p>
                                            <p className="text-xs" style={{ color: C.label }}>
                                                {[item.authorName, formatDate(item.createdAt)].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <WorldsRightSidebar mode="home" badges={earnedBadgesFromAreas(areas)} totalXp={totalXpFromAreas(areas)} />

            {showCreate && (
                <CreateNewsModal
                    onClose={() => setShowCreate(false)}
                    onCreated={created => setNews(prev => [created, ...prev])}
                />
            )}
        </div>
    );
}
