import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    FileText,
    ChevronLeft,
    Eye,
    Edit2,
    Trash2,
    Plus,
    User as UserIcon,
    Search,
    X,
    ExternalLink,
    Tag as TagIcon,
    Loader2
} from 'lucide-react';
import api from '../lib/axios';
import { renderReadOnlyBlock } from './PageView';
import type { Block } from './PageView';

interface GlobalTag {
    id: number;
    name: string;
    color: string;
}

interface Category {
    id: number;
    name: string;
    level?: number;
}

interface Page {
    id: string;
    title: string;
    slug: string;
    user_id: number;
    parent_id: string | null;
    updated_at: string;
    user?: {
        username: string;
    };
    content?: Block[];
    tag?: string;
    tag_color?: string;
    category_id?: number | null;
    category?: {
        id: number;
        name: string;
    };
}

interface PagesManagerProps {
    onBack: () => void;
    onEditPage: (slug: string) => void;
}

const PagesManager = ({ onBack, onEditPage }: PagesManagerProps) => {
    const navigate = useNavigate();
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [previewPage, setPreviewPage] = useState<Page | null>(null);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newTagColor, setNewTagColor] = useState('#6366f1');
    const [newCategoryId, setNewCategoryId] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const [globalTags, setGlobalTags] = useState<GlobalTag[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showTagManager, setShowTagManager] = useState(false);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState('#6366f1');
    const [isCreatingTag, setIsCreatingTag] = useState(false);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/pages');
            setPages(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch pages', err);
            setError('Impossible de charger les pages.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await api.get('/tags');
            setGlobalTags(response.data);
        } catch (err) {
            console.error('Failed to fetch tags', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            // Flatten categories for select dropdown
            const flatten = (cats: any[], list: Category[] = [], level = 0) => {
                cats.forEach(c => {
                    list.push({ id: c.id, name: c.name, level });
                    if (c.all_children) flatten(c.all_children, list, level + 1);
                });
                return list;
            };
            setCategories(flatten(response.data));
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    useEffect(() => {
        fetchPages();
        fetchTags();
        fetchCategories();
    }, []);

    const handleCreateGlobalTag = async () => {
        if (!tagName.trim()) return;
        try {
            setIsCreatingTag(true);
            const response = await api.post('/tags', {
                name: tagName,
                color: tagColor
            });
            setGlobalTags([...globalTags, response.data]);
            setTagName('');
            setTagColor('#6366f1');
        } catch (err) {
            console.error('Failed to create tag', err);
            alert('Erreur lors de la création du tag');
        } finally {
            setIsCreatingTag(false);
        }
    };

    const handleDeleteGlobalTag = async (id: number) => {
        if (!confirm('Supprimer ce tag ?')) return;
        try {
            await api.delete(`/tags/${id}`);
            setGlobalTags(globalTags.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete tag', err);
        }
    };

    const handleUpdateMetadata = async () => {
        if (!editingPage) return;
        try {
            setIsUpdating(true);
            const response = await api.put(`/pages/${editingPage.id}`, {
                title: newTitle,
                slug: newSlug.startsWith('/') ? newSlug.substring(1) : newSlug,
                tag: newTag,
                tag_color: newTagColor,
                category_id: newCategoryId
            });
            setPages(pages.map(p => p.id === editingPage.id ? {
                ...p,
                title: newTitle,
                slug: response.data.slug,
                tag: newTag,
                tag_color: newTagColor,
                category_id: newCategoryId,
                category: categories.find(c => c.id === newCategoryId)
            } : p));
            setEditingPage(null);
        } catch (err: any) {
            console.error('Update metadata failed', err);
            alert(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

        try {
            await api.delete(`/pages/${id}`);
            setPages(pages.filter(p => p.id !== id));
        } catch (err) {
            console.error('Delete failed', err);
            alert('Erreur lors de la suppression');
        }
    };

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-[#efefed] dark:hover:bg-[#252525] rounded-lg transition-colors text-[#91918e]"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#37352f] dark:text-[#d3d3d3]">Toutes les pages</h1>
                        <p className="text-[#91918e] text-sm mt-1">Gérez et éditez le contenu de votre wiki</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTagManager(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] text-[#37352f] dark:text-[#d3d3d3] rounded-lg font-medium transition-all hover:bg-gray-50 shadow-sm"
                    >
                        <TagIcon size={18} />
                        Gérer les Tags
                    </button>
                    <button
                        onClick={() => onEditPage('new')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        <Plus size={18} />
                        Nouvelle Page
                    </button>
                </div>
            </div>

            {/* Stats / Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-[#252525] p-4 rounded-xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm">
                    <div className="text-[#91918e] text-xs font-semibold uppercase tracking-wider mb-1">Total Pages</div>
                    <div className="text-2xl font-bold text-[#37352f] dark:text-[#d3d3d3]">{pages.length}</div>
                </div>
                <div className="md:col-span-2 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#91918e]">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher une page par titre ou slug..."
                        className="w-full h-full pl-10 pr-4 py-3 bg-white dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-[#37352f] dark:text-[#d3d3d3]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-[#91918e]">
                        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Chargement des pages...</p>
                    </div>
                ) : filteredPages.length === 0 ? (
                    <div className="p-20 text-center text-[#91918e]">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{searchQuery ? 'Aucune page ne correspond à votre recherche.' : 'Aucune page créée pour le moment.'}</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#fbfbfa] dark:bg-[#1f1f1f] border-b border-[#ececeb] dark:border-[#2f2f2f]">
                                <th className="px-6 py-4 text-[11px] font-bold text-[#91918e] uppercase tracking-wider w-[30%]">Page</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#91918e] uppercase tracking-wider w-[15%]">Catégorie</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#91918e] uppercase tracking-wider w-[15%]">Tag</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#91918e] uppercase tracking-wider w-[15%]">Auteur</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#91918e] uppercase tracking-wider w-[15%]">Mis à jour</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[#91918e] uppercase tracking-wider text-right w-[10%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ececeb] dark:divide-[#2f2f2f]">
                            {filteredPages.map((page) => (
                                <tr key={page.id} className="hover:bg-[#fbfbfa] dark:hover:bg-[#1f1f1f] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <FileText size={18} />
                                            </div>
                                            <div
                                                className="cursor-pointer group/title"
                                                onClick={() => {
                                                    setEditingPage(page);
                                                    setNewTitle(page.title);
                                                    setNewSlug(page.slug);
                                                    setNewTag(page.tag || '');
                                                    setNewTagColor(page.tag_color || '#6366f1');
                                                    setNewCategoryId(page.category_id || null);
                                                }}
                                            >
                                                <div className="font-medium text-[#37352f] dark:text-[#d3d3d3] group-hover/title:text-indigo-600 transition-colors">{page.title}</div>
                                                <div className="text-xs text-[#91918e] font-mono group-hover/title:text-indigo-400 transition-colors">/{page.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {page.category ? (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg w-fit">
                                                <span>📁</span> {page.category.name}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-[#91918e] italic">Aucune</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            onClick={() => {
                                                setEditingPage(page);
                                                setNewTitle(page.title);
                                                setNewSlug(page.slug);
                                                setNewTag(page.tag || '');
                                                setNewTagColor(page.tag_color || '#6366f1');
                                                setNewCategoryId(page.category_id || null);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {page.tag ? (
                                                <span
                                                    className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105 inline-block"
                                                    style={{ backgroundColor: page.tag_color + '20', color: page.tag_color, border: `1px solid ${page.tag_color}40` }}
                                                >
                                                    {page.tag}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-[#ececeb] dark:border-[#2f2f2f] text-[10px] font-bold text-[#91918e] hover:border-indigo-500/50 hover:text-indigo-500 transition-all uppercase tracking-wider w-fit">
                                                    <Plus size={10} /> Tag
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-[#37352f] dark:text-[#d3d3d3]">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-[#1e1e1e] flex items-center justify-center text-[#91918e]">
                                                <UserIcon size={12} />
                                            </div>
                                            {page.user?.username || 'Inconnu'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[11px] text-[#91918e] font-mono whitespace-nowrap">
                                            {formatDate(page.updated_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button
                                                title="Prévisualiser"
                                                onClick={() => setPreviewPage(page)}
                                                className="p-2 hover:bg-white dark:hover:bg-[#2f2f2f] rounded-lg border border-transparent hover:border-[#ececeb] dark:hover:border-[#3f3f3f] text-[#91918e] hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                title="Modifier"
                                                onClick={() => onEditPage(page.slug)}
                                                className="p-2 hover:bg-white dark:hover:bg-[#2f2f2f] rounded-lg border border-transparent hover:border-[#ececeb] dark:hover:border-[#3f3f3f] text-[#91918e] hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                title="Supprimer"
                                                onClick={() => handleDelete(page.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900/30 text-[#91918e] hover:text-red-500 dark:hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Preview Modal */}
            {previewPage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#191919] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-4 border-b border-[#ececeb] dark:border-[#2f2f2f] bg-[#fbfbfa] dark:bg-[#1e1e1e]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#37352f] dark:text-[#ebebeb] line-clamp-1">{previewPage.title}</h3>
                                    <p className="text-xs text-[#91918e]">Prévisualisation du contenu</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/pages/${previewPage.slug}`)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-xl text-sm font-semibold text-[#37352f] dark:text-[#d3d3d3] transition-colors"
                                >
                                    <ExternalLink size={16} />
                                    Voir la page
                                </button>
                                <button
                                    onClick={() => setPreviewPage(null)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-[#91918e] hover:text-red-500 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-4xl font-black text-[#37352f] dark:text-[#ebebeb] mb-8 tracking-tight">
                                    {previewPage.title}
                                </h1>
                                <div className="space-y-4">
                                    {previewPage.content && previewPage.content.length > 0 ? (
                                        previewPage.content.map((block) => (
                                            <div key={block.id}>
                                                {renderReadOnlyBlock(block)}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center text-[#91918e] italic">
                                            Cette page n'a aucun contenu.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-4 bg-[#fbfbfa] dark:bg-[#1e1e1e] border-t border-[#ececeb] dark:border-[#2f2f2f] flex justify-between items-center text-xs text-[#91918e]">
                            <div className="flex gap-4">
                                <span>Auteur: <span className="font-semibold">{previewPage.user?.username}</span></span>
                                <span>Modifié le: <span className="font-semibold">{formatDate(previewPage.updated_at)}</span></span>
                            </div>
                            <button
                                onClick={() => setPreviewPage(null)}
                                className="px-6 py-2 bg-[#37352f] dark:bg-[#ebebeb] text-white dark:text-[#191919] font-bold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editing Metadata Modal */}
            {editingPage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-[#37352f] dark:text-[#ebebeb]">Paramètres de la page</h3>
                            <button onClick={() => setEditingPage(null)} className="text-[#91918e] hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-[#91918e] dark:text-[#a1a19f] uppercase tracking-wider mb-2">Titre de la page</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-semibold text-[#37352f] dark:text-[#ebebeb]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#91918e] dark:text-[#a1a19f] uppercase tracking-wider mb-2">Lien (URL)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91918e] font-mono text-sm">/</span>
                                    <input
                                        type="text"
                                        value={newSlug}
                                        onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        className="w-full pl-7 pr-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-mono text-[#37352f] dark:text-[#ebebeb]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#91918e] dark:text-[#a1a19f] uppercase tracking-wider mb-2">Catégorie</label>
                                <select
                                    value={newCategoryId || ''}
                                    onChange={e => setNewCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-semibold text-[#37352f] dark:text-[#ebebeb] appearance-none"
                                >
                                    <option value="">Aucune catégorie</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {'\u00A0'.repeat((cat.level || 0) * 3)}{cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-6 border-t border-[#ececeb] dark:border-[#2f2f2f]">
                                <label className="block text-[11px] font-bold text-[#91918e] dark:text-[#a1a19f] uppercase tracking-wider mb-3">Tag (Badge)</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <button
                                        onClick={() => {
                                            setNewTag('');
                                            setNewTagColor('#6366f1');
                                        }}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${!newTag ? 'bg-gray-100 border-gray-300 text-gray-600' : 'border-[#ececeb] text-[#91918e] hover:bg-gray-50'}`}
                                    >
                                        Aucun
                                    </button>
                                    {globalTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => {
                                                setNewTag(tag.name);
                                                setNewTagColor(tag.color);
                                            }}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${newTag === tag.name ? 'shadow-md scale-105' : 'opacity-60 hover:opacity-100'}`}
                                            style={{
                                                backgroundColor: newTag === tag.name ? tag.color + '20' : 'transparent',
                                                color: tag.color,
                                                borderColor: newTag === tag.name ? tag.color : '#ececeb'
                                            }}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setEditingPage(null)}
                                className="flex-1 px-4 py-2 border border-[#ececeb] dark:border-[#2f2f2f] rounded-lg text-sm font-semibold text-[#37352f] dark:text-[#d3d3d3] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleUpdateMetadata}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tag Manager Modal */}
            {showTagManager && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ececeb] dark:border-[#2f2f2f] bg-[#fbfbfa] dark:bg-[#1e1e1e]">
                            <h3 className="text-lg font-bold text-[#37352f] dark:text-[#ebebeb]">Gestionnaire de Tags</h3>
                            <button onClick={() => setShowTagManager(false)} className="text-[#91918e] hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 border-b border-[#ececeb] dark:border-[#2f2f2f] bg-gray-50 dark:bg-[#252525]">
                            <label className="block text-xs font-bold text-[#91918e] uppercase mb-2">Créer un nouveau tag global</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagName}
                                    onChange={e => setTagName(e.target.value.toUpperCase())}
                                    placeholder="NOM DU TAG..."
                                    className="flex-1 px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-[#ececeb] dark:border-[#2f2f2f] rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                                />
                                <div className="flex gap-1 shrink-0">
                                    {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#6b7280'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setTagColor(color)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${tagColor === color ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={handleCreateGlobalTag}
                                    disabled={isCreatingTag || !tagName.trim()}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-all"
                                >
                                    {isCreatingTag ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[400px] p-6">
                            <h4 className="text-[10px] font-black text-[#91918e] uppercase tracking-widest mb-4">Tags existants</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {globalTags.map(tag => (
                                    <div key={tag.id} className="group flex items-center justify-between p-3 rounded-xl border border-[#ececeb] dark:border-[#2f2f2f] hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                            <span className="text-xs font-bold text-[#37352f] dark:text-[#ebebeb]">{tag.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteGlobalTag(tag.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-[#91918e] hover:text-red-500 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {globalTags.length === 0 && (
                                    <div className="col-span-2 py-8 text-center text-[#91918e] text-xs italic">
                                        Aucun tag global créé pour le moment.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-[#fbfbfa] dark:bg-[#1e1e1e] border-t border-[#ececeb] dark:border-[#2f2f2f] text-right">
                            <button
                                onClick={() => setShowTagManager(false)}
                                className="px-6 py-2 bg-[#37352f] dark:bg-[#ebebeb] text-white dark:text-[#191919] font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
                            >
                                Terminer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagesManager;
