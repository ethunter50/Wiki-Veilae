import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    FileText,
    Loader2,
    Folder,
} from 'lucide-react';
import api from '../lib/axios';

interface Item {
    id: number;
    title: string;
    order: number;
    type: 'category' | 'page';
    children?: Item[]; // Mixed children
    raw?: any; // Original raw data
}

interface Page {
    id: number;
    title: string;
    slug: string;
    parent_id: number | null;
    category_id: number | null;
    order: number;
    children?: Page[];
}

interface Category {
    id: number;
    name: string;
    order: number;
    all_children?: Category[];
    pages?: Page[];
}

interface GlobalManagerProps {
    onBack: () => void;
}

const GlobalManager = ({ onBack }: GlobalManagerProps) => {
    const [structure, setStructure] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catsRes, pagesRes] = await Promise.all([
                api.get('/categories'), // Expects nested categories with included pages
                api.get('/pages') // Expects all pages
            ]);

            // We need to build a unified tree structure
            // 1. Process Categories (they contain subcats)
            // 2. Process Pages (need to insert them into the categories or keep as root)

            // Let's create a recursive function to convert Category -> Item
            const processCategory = (cat: Category): Item => {
                // Convert sub-categories
                const childItems: Item[] = (cat.all_children || []).map(processCategory);

                // Convert direct pages of this category
                const pageItems: Item[] = (cat.pages || []).map(p => ({
                    id: p.id,
                    title: p.title,
                    order: p.order,
                    type: 'page',
                    // Pages can currently have sub-pages too (via parent_id), but usually we list them under the category?
                    // The standard UI displays pages of a category.
                    // If a page has a parent_id, it is a sub-page.
                    // For now, let's assume category pages are direct children in sorting order.
                    // If a page inside a category has children pages, we should handle that.
                    // We need a helper for pages too.
                    children: [], // will be filled if page has children logic
                    raw: p
                }));

                const mixedChildren = [...childItems, ...pageItems].sort((a, b) => a.order - b.order);

                return {
                    id: cat.id,
                    title: cat.name,
                    order: cat.order,
                    type: 'category',
                    children: mixedChildren,
                    raw: cat
                };
            };

            // Note: The pages endpoint usually just lists pages.
            // We need to identify ROOT pages (no category, no parent).
            // Pages that belong to a category are already inside 'catsRes' if the backend includes them?
            // Actually, `Category::with(['allChildren', 'pages'])` includes pages.
            // So we just need to handle ROOT pages here.

            const rawPages = pagesRes.data;
            const rootPages = rawPages.filter((p: Page) => !p.category_id && !p.parent_id);
            const rootPageItems: Item[] = rootPages.map((p: Page) => ({
                id: p.id,
                title: p.title,
                order: p.order,
                type: 'page',
                children: [], // Handle sub-pages if necessary
                raw: p
            }));

            // Process Root Categories
            const rawCategories = catsRes.data;
            const rootCategoryItems: Item[] = rawCategories.map(processCategory);

            // Merge Root Categories and Root Pages
            const mergedRoot = [...rootCategoryItems, ...rootPageItems].sort((a, b) => a.order - b.order);

            setStructure(mergedRoot);

        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (uniqueKey: string) => {
        const next = new Set(expanded);
        next.has(uniqueKey) ? next.delete(uniqueKey) : next.add(uniqueKey);
        setExpanded(next);
    };

    const handleMove = async (e: React.MouseEvent, item: Item, siblings: Item[], direction: 'up' | 'down') => {
        e.stopPropagation();
        const index = siblings.findIndex(s => s.id === item.id && s.type === item.type);
        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            // Swap logic
            // We need to re-index the whole sibling array to ensure consistency because we are mixing types
            // Create a new array of { id, type, order }
            const newOrderPayload = siblings.map((s, i) => {
                let newOrder = i;
                if (i === index) newOrder = index - 1;
                if (i === index - 1) newOrder = index;

                return {
                    id: s.id,
                    type: s.type,
                    order: newOrder
                };
            }).sort((a, b) => a.order - b.order); // Sort by the new order to check validity

            await api.post('/structure/reorder', { items: newOrderPayload });
            fetchData();
        } else if (direction === 'down' && index < siblings.length - 1) {
            const newOrderPayload = siblings.map((s, i) => {
                let newOrder = i;
                if (i === index) newOrder = index + 1;
                if (i === index + 1) newOrder = index;

                return {
                    id: s.id,
                    type: s.type,
                    order: newOrder
                };
            }).sort((a, b) => a.order - b.order);

            await api.post('/structure/reorder', { items: newOrderPayload });
            fetchData();
        }
    };

    const renderItem = (item: Item, siblings: Item[], depth: number = 0) => {
        const uniqueKey = `${item.type}-${item.id}`;
        const isExpanded = expanded.has(uniqueKey);
        const hasChildren = item.children && item.children.length > 0;

        return (
            <div key={uniqueKey} className="flex flex-col">
                <div
                    className={`group flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-[#252525] rounded-xl transition-all cursor-default ${item.type === 'page' ? 'ml-0' : ''}`}
                    style={{ paddingLeft: `${depth * 20 + 12}px` }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-5 flex justify-center">
                            {hasChildren ? (
                                <button onClick={() => toggleExpand(uniqueKey)} className="text-[#91918e] hover:text-[#37352f]">
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            ) : (
                                <div className="w-5" />
                            )}
                        </div>

                        {item.type === 'category' ? (
                            <Folder size={16} className="text-indigo-500 opacity-70" />
                        ) : (
                            <FileText size={16} className="text-gray-400" />
                        )}

                        <span className={`text-sm ${item.type === 'category' ? 'font-bold' : ''} text-[#37352f] dark:text-[#ebebeb]`}>
                            {item.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleMove(e, item, siblings, 'up')} className="p-1 hover:bg-white dark:hover:bg-[#1e1e1e] border border-transparent hover:border-gray-200 rounded text-[#91918e]">
                            <ArrowUp size={14} />
                        </button>
                        <button onClick={(e) => handleMove(e, item, siblings, 'down')} className="p-1 hover:bg-white dark:hover:bg-[#1e1e1e] border border-transparent hover:border-gray-200 rounded text-[#91918e]">
                            <ArrowDown size={14} />
                        </button>
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className="flex flex-col">
                        {item.children?.map(child => renderItem(child, item.children || [], depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-[#efefed] dark:hover:bg-[#252525] rounded-lg transition-colors text-[#91918e]">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[#37352f] dark:text-[#d3d3d3]">Organisation Unifiée</h1>
                    <p className="text-[#91918e] text-sm mt-1">Mélangez et ordonnez vos catégories et pages librement</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#ececeb] dark:border-[#2f2f2f] bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#91918e] uppercase tracking-widest">Structure Complète</span>
                    <button onClick={fetchData} className="text-xs text-indigo-600 hover:underline font-bold">Rafraîchir</button>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-[#91918e]">
                        <Loader2 size={32} className="animate-spin mb-4 text-indigo-600" />
                        <p className="font-semibold">Chargement de la structure...</p>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col gap-0.5">
                        {structure.map(item => renderItem(item, structure))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalManager;
