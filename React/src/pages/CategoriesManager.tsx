import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    ChevronLeft,
    Search,
    Folder,
    ChevronDown,
    ChevronRight,
    Edit2,
    X,
    Loader2,
    FolderPlus,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import api from '../lib/axios';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    icon: string | null;
    order: number;
    children?: Category[];
    all_children?: Category[];
}

interface CategoriesManagerProps {
    onBack: () => void;
}

const CategoriesManager = ({ onBack }: CategoriesManagerProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState<number | null>(null);
    const [icon, setIcon] = useState('Folder');

    // UI states
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleOpenCreate = (pId: number | null = null) => {
        setEditingCategory(null);
        setName('');
        setDescription('');
        setParentId(pId);
        setIcon('Folder');
        setShowFormModal(true);
    };

    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setDescription(category.description || '');
        setParentId(category.parent_id);
        setIcon(category.icon || 'Folder');
        setShowFormModal(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            const payload = {
                name,
                description,
                parent_id: parentId,
                icon,
                order: editingCategory?.order || 0
            };

            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, payload);
            } else {
                await api.post('/categories', payload);
            }

            await fetchCategories();
            setShowFormModal(false);
        } catch (err) {
            console.error('Failed to save category', err);
            alert('Erreur lors de la sauvegarde de la catégorie');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cette catégorie ? Cela supprimera également toutes ses sous-catégories.')) return;

        try {
            await api.delete(`/categories/${id}`);
            await fetchCategories();
        } catch (err) {
            console.error('Failed to delete category', err);
            alert('Erreur lors de la suppression');
        }
    };

    const handleMove = async (e: React.MouseEvent, category: Category, direction: 'up' | 'down') => {
        e.stopPropagation();

        // Find siblings
        let siblings: Category[] = [];
        if (category.parent_id === null) {
            siblings = [...categories];
        } else {
            const findSiblings = (cats: Category[]): Category[] | null => {
                for (const c of cats) {
                    if (c.id === category.parent_id) return [...(c.all_children || [])];
                    if (c.all_children) {
                        const found = findSiblings(c.all_children);
                        if (found) return found;
                    }
                }
                return null;
            };
            siblings = findSiblings(categories) || [];
        }

        if (siblings.length <= 1) return;

        const index = siblings.findIndex(s => s.id === category.id);
        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            const newOrder = siblings.map((s, i) => {
                if (i === index) return { id: s.id, order: index - 1 };
                if (i === index - 1) return { id: s.id, order: index };
                return { id: s.id, order: i };
            });
            await api.post('/categories/reorder', { categories: newOrder });
            fetchCategories();
        } else if (direction === 'down' && index < siblings.length - 1) {
            const newOrder = siblings.map((s, i) => {
                if (i === index) return { id: s.id, order: index + 1 };
                if (i === index + 1) return { id: s.id, order: index };
                return { id: s.id, order: i };
            });
            await api.post('/categories/reorder', { categories: newOrder });
            fetchCategories();
        }
    };

    const renderCategoryRow = (category: Category, level: number = 0) => {
        const hasChildren = category.all_children && category.all_children.length > 0;
        const isExpanded = expandedIds.has(category.id);

        // Filter search
        if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            // Check if any children match
            const hasMatchingChild = category.all_children?.some(child => child.name.toLowerCase().includes(searchQuery.toLowerCase()));
            if (!hasMatchingChild) return null;
        }

        return (
            <div key={category.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div
                    className={`group flex items-center justify-between py-3 px-4 rounded-xl border border-transparent hover:border-[#ececeb] dark:hover:border-[#2f2f2f] hover:bg-white dark:hover:bg-[#252525] transition-all cursor-default`}
                    style={{ marginLeft: `${level * 24}px` }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6">
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpand(category.id)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] rounded transition-colors text-[#91918e]"
                                >
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ececeb] dark:bg-[#3f3f3f]" />
                            )}
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Folder size={18} />
                        </div>

                        <div>
                            <div className="text-sm font-bold text-[#37352f] dark:text-[#ebebeb] flex items-center gap-2">
                                {category.name}
                                <span className="text-[10px] font-mono text-[#91918e] opacity-0 group-hover:opacity-100 transition-opacity">/{category.slug}</span>
                            </div>
                            {category.description && (
                                <div className="text-[11px] text-[#91918e] line-clamp-1">{category.description}</div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => handleMove(e, category, 'up')}
                            className="p-1.5 hover:bg-white dark:hover:bg-[#1e1e1e] border border-transparent hover:border-[#ececeb] dark:hover:border-[#3f3f3f] text-[#91918e] hover:text-indigo-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Monter"
                        >
                            <ArrowUp size={14} />
                        </button>
                        <button
                            onClick={(e) => handleMove(e, category, 'down')}
                            className="p-1.5 hover:bg-white dark:hover:bg-[#1e1e1e] border border-transparent hover:border-[#ececeb] dark:hover:border-[#3f3f3f] text-[#91918e] hover:text-indigo-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Descendre"
                        >
                            <ArrowDown size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                            onClick={() => handleOpenCreate(category.id)}
                            className="p-2 hover:bg-white dark:hover:bg-[#1e1e1e] border border-transparent hover:border-[#ececeb] dark:hover:border-[#3f3f3f] text-[#91918e] hover:text-indigo-600 rounded-lg transition-all"
                            title="Ajouter une sous-catégorie"
                        >
                            <FolderPlus size={16} />
                        </button>
                        <button
                            onClick={() => handleOpenEdit(category)}
                            className="p-2 hover:bg-white dark:hover:bg-[#1e1e1e] border border-transparent hover:border-[#ececeb] dark:hover:border-[#3f3f3f] text-[#91918e] hover:text-indigo-600 rounded-lg transition-all"
                            title="Modifier"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 text-[#91918e] hover:text-red-500 rounded-lg transition-all"
                            title="Supprimer"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {isExpanded && category.all_children && category.all_children.length > 0 && (
                    <div className="mt-1">
                        {category.all_children.map(child => renderCategoryRow(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Flatten for parent selection
    const getAllCategories = (cats: Category[], list: { id: number, name: string, level: number }[] = [], level = 0) => {
        cats.forEach(cat => {
            list.push({ id: cat.id, name: cat.name, level });
            if (cat.all_children) getAllCategories(cat.all_children, list, level + 1);
        });
        return list;
    };

    const flatCategories = getAllCategories(categories);

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <h1 className="text-3xl font-bold text-[#37352f] dark:text-[#d3d3d3]">Gestion des Catégories</h1>
                        <p className="text-[#91918e] text-sm mt-1">Organisez votre contenu avec une hiérarchie personnalisée</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenCreate()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus size={18} />
                    Nouvelle Catégorie
                </button>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#91918e]">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher une catégorie..."
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-[#37352f] dark:text-[#d3d3d3] shadow-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-[#fbfbfa] dark:bg-[#1e1e1e] p-6 rounded-2xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-[#91918e]">
                        <Loader2 size={32} className="animate-spin mb-4 text-indigo-600" />
                        <p className="font-semibold">Chargement des catégories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-20 text-center text-[#91918e]">
                        <Folder size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold">Aucune catégorie</p>
                        <p className="text-sm">Commencez par créer votre première catégorie parente.</p>
                        <button
                            onClick={() => handleOpenCreate()}
                            className="mt-6 text-indigo-600 font-bold hover:underline"
                        >
                            Créer maintenant
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center gap-4 px-4 py-2 border-b border-[#ececeb] dark:border-[#2f2f2f] mb-4">
                            <span className="text-[11px] font-black text-[#91918e] uppercase tracking-widest">Arborescence</span>
                        </div>
                        {categories.map(category => renderCategoryRow(category))}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-[#ececeb] dark:border-[#2f2f2f]">
                            <h3 className="text-xl font-bold text-[#37352f] dark:text-[#ebebeb]">
                                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                            </h3>
                            <button onClick={() => setShowFormModal(false)} className="text-[#91918e] hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-[#91918e] uppercase tracking-widest mb-2">Nom de la catégorie</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Documentation, News..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-[#37352f] dark:text-[#ebebeb]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#91918e] uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="À quoi sert cette catégorie ?"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] resize-none text-sm font-medium text-[#37352f] dark:text-[#ebebeb]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#91918e] uppercase tracking-widest mb-2">Catégorie parente</label>
                                <select
                                    value={parentId || ''}
                                    onChange={e => setParentId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-[#37352f] dark:text-[#ebebeb] appearance-none"
                                >
                                    <option value="">Aucune (Catégorie racine)</option>
                                    {flatCategories
                                        .filter(c => !editingCategory || c.id !== editingCategory.id) // Non-circular
                                        .map(c => (
                                            <option key={c.id} value={c.id}>
                                                {'\u00A0'.repeat(c.level * 4)}{c.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-gray-50 dark:bg-[#252525] flex gap-3">
                            <button
                                onClick={() => setShowFormModal(false)}
                                className="flex-1 px-4 py-2 border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl font-bold text-[#91918e] hover:bg-white dark:hover:bg-[#1e1e1e] transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving || !name.trim()}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
                                {editingCategory ? 'Sauvegarder' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesManager;
