import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import {
    Plus,
    Trash2,
    Type,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Code,
    Save,
    ChevronLeft,
    Loader2,
    Quote,
    Minus,
    AlertCircle,
    CheckSquare,
    List as ListIcon,
    ListOrdered,
    Video,
    Columns as ColumnsIcon,
    Table as TableIcon,
    GripVertical,
    Upload,
    X
} from 'lucide-react';
import api from '../lib/axios';

interface Block {
    id: string;
    type: 'text' | 'h1' | 'h2' | 'h3' | 'image' | 'code' | 'quote' | 'divider' | 'callout' | 'todo' | 'bullet' | 'number' | 'video' | 'columns' | 'table';
    content: string;
    checked?: boolean;
    columns?: Column[];
    tableData?: string[][];
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
}

interface Column {
    id: string;
    blocks: Block[];
}

interface WikiEditorProps {
    initialData?: {
        id?: number;
        title: string;
        content: Block[];
    };
    onBack: () => void;
    onSave?: (data: any) => void;
}

const WikiEditor = ({ initialData, onBack, onSave }: WikiEditorProps) => {
    const [pageId, setPageId] = useState<number | undefined>(initialData?.id);
    const [title, setTitle] = useState(initialData?.title || '');
    const [blocks, setBlocks] = useState<Block[]>(initialData?.content || [
        { id: Math.random().toString(36).substr(2, 9), type: 'text', content: '' }
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const { slug } = useParams<{ slug: string }>();

    useEffect(() => {
        if (slug && slug !== 'new') {
            const fetchPage = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get(`/pages/${slug}`);
                    const page = response.data;
                    setPageId(page.id);
                    setTitle(page.title);
                    setBlocks(page.content || [{ id: Math.random().toString(36).substr(2, 9), type: 'text', content: '' }]);
                    setSelectedCategoryId(page.category_id);
                } catch (err) {
                    console.error("Failed to fetch page", err);
                    alert("Erreur lors du chargement de la page");
                    onBack();
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPage();
        } else if (initialData) {
            setPageId(initialData.id);
            setTitle(initialData.title);
            if (initialData.content) setBlocks(initialData.content);
        }

        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                const flatten = (cats: any[], list: any[] = [], level = 0) => {
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
        fetchCategories();
    }, [slug, initialData]);

    const createNewBlock = (type: Block['type']): Block => {
        const id = Math.random().toString(36).substr(2, 9);
        const baseBlock: Block = { id, type, content: '' };

        if (type === 'todo') baseBlock.checked = false;
        if (type === 'columns') {
            baseBlock.columns = [
                { id: Math.random().toString(36).substr(2, 9), blocks: [{ id: Math.random().toString(36).substr(2, 9), type: 'text', content: '' }] },
                { id: Math.random().toString(36).substr(2, 9), blocks: [{ id: Math.random().toString(36).substr(2, 9), type: 'text', content: '' }] }
            ];
        }
        if (type === 'table') {
            baseBlock.tableData = [['', ''], ['', '']];
        }

        return baseBlock;
    };

    const createAndFocusBlock = (type: Block['type'], afterIndex: number, blocksList: Block[], setBlocksList: (b: Block[]) => void) => {
        const newBlock = createNewBlock(type);
        const newBlocks = [...blocksList];
        newBlocks.splice(afterIndex + 1, 0, newBlock);
        setBlocksList(newBlocks);
        setFocusedBlockId(newBlock.id);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Veuillez donner un titre à votre page.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title: title,
                content: blocks,
                is_published: true,
                category_id: selectedCategoryId
            };

            let response;
            if (pageId) {
                response = await api.put(`/pages/${pageId}`, payload);
            } else {
                response = await api.post('/pages', payload);
            }

            if (onSave) onSave(response.data);
            onBack();
        } catch (err: any) {
            console.error("Failed to save page", err);
            if (err.response?.status === 422) {
                alert(err.response.data.message || "Une page avec ce titre existe déjà.");
            } else {
                alert("Erreur lors de la sauvegarde de la page.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-12 animate-in fade-in duration-500 min-h-screen pb-64">
            <header className="flex items-center justify-between mb-16 sticky top-0 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md z-40 py-4 -mx-4 px-4 transition-all">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg text-[#91918e] transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-sm font-bold text-[#37352f] dark:text-[#ebebeb]">
                        Éditeur / {isLoading ? 'Chargement...' : (title || 'Nouvelle page')}
                    </h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !title.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Enregistrer la page
                </button>
            </header>

            <div className="space-y-4">
                <div className="mb-4">
                    <select
                        value={selectedCategoryId || ''}
                        onChange={e => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-transparent text-sm font-bold text-indigo-600 border border-indigo-200 dark:border-indigo-900/40 rounded-lg px-3 py-1.5 outline-none hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                    >
                        <option value="">📁 Choisir une catégorie...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="text-[#37352f] dark:text-[#ebebeb]">
                                {'\u00A0'.repeat(cat.level * 3)}{cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de la page..."
                    className="w-full text-5xl font-black bg-transparent border-none outline-none placeholder:opacity-10 text-[#37352f] dark:text-[#ebebeb] caret-indigo-600 mb-12"
                />

                <div className="space-y-0.5">
                    {blocks.map((block, index) => (
                        <BlockRenderer
                            key={block.id}
                            block={block}
                            index={index}
                            parentBlocks={blocks}
                            setParentBlocks={setBlocks}
                            draggedBlockIndex={draggedBlockIndex}
                            setDraggedBlockIndex={setDraggedBlockIndex}
                            createNewBlock={createNewBlock}
                            onImageDoubleClick={(src) => setSelectedImage(src)}
                            createAndFocusBlock={createAndFocusBlock}
                            focusedBlockId={focusedBlockId}
                            setFocusedBlockId={setFocusedBlockId}
                        />
                    ))}
                </div>

                <div className="pt-20 pb-64 text-center">
                    <div className="flex flex-wrap justify-center gap-2 px-12">
                        <AdderButton icon={<Type size={18} />} label="Texte" onClick={() => setBlocks([...blocks, createNewBlock('text')])} />
                        <AdderButton icon={<Heading1 size={18} />} label="H1" onClick={() => setBlocks([...blocks, createNewBlock('h1')])} />
                        <AdderButton icon={<Heading2 size={18} />} label="H2" onClick={() => setBlocks([...blocks, createNewBlock('h2')])} />
                        <AdderButton icon={<Heading3 size={18} />} label="H3" onClick={() => setBlocks([...blocks, createNewBlock('h3')])} />
                        <AdderButton icon={<CheckSquare size={18} />} label="To-do" onClick={() => setBlocks([...blocks, createNewBlock('todo')])} />
                        <AdderButton icon={<ListIcon size={18} />} label="Liste" onClick={() => setBlocks([...blocks, createNewBlock('bullet')])} />
                        <AdderButton icon={<ListOrdered size={18} />} label="Numéros" onClick={() => setBlocks([...blocks, createNewBlock('number')])} />
                        <AdderButton icon={<Quote size={18} />} label="Citation" onClick={() => setBlocks([...blocks, createNewBlock('quote')])} />
                        <AdderButton icon={<AlertCircle size={18} />} label="Alerte" onClick={() => setBlocks([...blocks, createNewBlock('callout')])} />
                        <AdderButton icon={<ImageIcon size={18} />} label="Image" onClick={() => setBlocks([...blocks, createNewBlock('image')])} />
                        <AdderButton icon={<Video size={18} />} label="Vidéo" onClick={() => setBlocks([...blocks, createNewBlock('video')])} />
                        <AdderButton icon={<Code size={18} />} label="Code" onClick={() => setBlocks([...blocks, createNewBlock('code')])} />
                        <AdderButton icon={<TableIcon size={18} />} label="Tableau" onClick={() => setBlocks([...blocks, createNewBlock('table')])} />
                        <AdderButton icon={<ColumnsIcon size={18} />} label="Colonnes" onClick={() => setBlocks([...blocks, createNewBlock('columns')])} />
                        <AdderButton icon={<Minus size={18} />} label="Ligne" onClick={() => setBlocks([...blocks, createNewBlock('divider')])} />
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        alt="Visualisation"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

const AdderButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#202020] border border-[#ececeb] dark:border-[#2f2f2f] rounded-lg text-xs font-semibold text-[#37352f] dark:text-[#ebebeb] hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
    >
        {icon} {label}
    </button>
);

const getBulletNumber = (block: Block, parentBlocks: Block[]): number => {
    let count = 1;
    const index = parentBlocks.findIndex(b => b.id === block.id);
    for (let i = index - 1; i >= 0; i--) {
        if (parentBlocks[i].type === 'number') {
            count++;
        } else {
            break;
        }
    }
    return count;
};

const BlockRenderer = ({
    block,
    index,
    parentBlocks,
    setParentBlocks,
    draggedBlockIndex,
    setDraggedBlockIndex,
    createNewBlock,
    onImageDoubleClick,
    createAndFocusBlock,
    focusedBlockId,
    setFocusedBlockId
}: {
    block: Block,
    index: number,
    parentBlocks: Block[],
    setParentBlocks: (b: Block[]) => void,
    draggedBlockIndex: number | null,
    setDraggedBlockIndex: (i: number | null) => void,
    createNewBlock: (type: Block['type']) => Block,
    onImageDoubleClick: (src: string) => void,
    createAndFocusBlock: (type: Block['type'], index: number, list: Block[], set: (b: Block[]) => void) => void,
    focusedBlockId: string | null,
    setFocusedBlockId: (id: string | null) => void
}) => {
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

    useEffect(() => {
        if (focusedBlockId === block.id && textareaRef.current) {
            textareaRef.current.focus();
            setFocusedBlockId(null);
        }
    }, [focusedBlockId, block.id]);

    const handleDragStart = (e: React.DragEvent) => {
        setDraggedBlockIndex(index);
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (fromIndex === index) return;

        const newBlocks = [...parentBlocks];
        const [movedBlock] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(index, 0, movedBlock);
        setParentBlocks(newBlocks);
        setDraggedBlockIndex(null);
    };


    const isList = ['bullet', 'number', 'todo'].includes(block.type);

    return (
        <div
            className={`group relative flex items-start gap-4 w-full p-2 rounded-xl transition-all border border-transparent hover:border-[#ececeb] dark:hover:border-[#2f2f2f] ${isList ? 'mb-0' : 'mb-1'} ${draggedBlockIndex === index ? 'opacity-30' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 absolute -left-14 top-1/2 -translate-y-1/2 transition-all">
                <div
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={() => setDraggedBlockIndex(null)}
                    className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-[#252525] rounded text-[#91918e]"
                    title="Glisser pour déplacer"
                >
                    <GripVertical size={16} />
                </div>

                <button
                    onClick={() => {
                        if (parentBlocks.length > 1) {
                            setParentBlocks(parentBlocks.filter(b => b.id !== block.id));
                        }
                    }}
                    className="p-1.5 hover:bg-red-50 text-[#91918e] hover:text-red-500 rounded transition-colors"
                    title="Supprimer le bloc"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="opacity-0 group-hover:opacity-100 absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-all">
                <button
                    onClick={() => setShowSizeMenu(!showSizeMenu)}
                    className={`p-1.5 rounded transition-all ${showSizeMenu ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-[#91918e]'}`}
                    title="Taille du texte"
                >
                    <Type size={16} />
                </button>

                {showSizeMenu && (
                    <div className="absolute right-full mr-2 bg-white dark:bg-[#191919] border border-[#ececeb] dark:border-[#2f2f2f] rounded-lg shadow-xl p-1 flex items-center gap-1 animate-in slide-in-from-right-2">
                        {['sm', 'base', 'lg', 'xl'].map(size => (
                            <button
                                key={size}
                                onClick={() => {
                                    setParentBlocks(parentBlocks.map(b => b.id === block.id ? { ...b, fontSize: size as any } : b));
                                    setShowSizeMenu(false);
                                }}
                                className={`px-2 py-1 text-[10px] font-bold rounded ${block.fontSize === size ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-[#91918e]'}`}
                            >
                                {size.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-[32px]">
                {block.type === 'columns' ? (
                    <div className="flex flex-col gap-4 my-4">
                        <div className="flex gap-4">
                            {block.columns?.map((col, cIdx) => (
                                <div key={col.id} className="flex-1 border border-dashed border-[#ececeb] dark:border-[#2f2f2f] rounded-xl p-4 min-h-[100px] relative group/col">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-[#91918e]">COLONNE {cIdx + 1}</span>
                                        {block.columns && block.columns.length > 1 && (
                                            <button
                                                onClick={() => {
                                                    const newCols = block.columns?.filter(c => c.id !== col.id);
                                                    setParentBlocks(parentBlocks.map(b => b.id === block.id ? { ...b, columns: newCols } : b));
                                                }}
                                                className="opacity-0 group-hover/col:opacity-100 p-1 text-red-400 hover:bg-red-50 rounded transition-all"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {col.blocks.map((subBlock, subIdx) => (
                                            <BlockRenderer
                                                key={subBlock.id}
                                                block={subBlock}
                                                index={subIdx}
                                                parentBlocks={col.blocks}
                                                setParentBlocks={(newSubBlocks) => {
                                                    setParentBlocks(parentBlocks.map(b => b.id === block.id ? {
                                                        ...b,
                                                        columns: b.columns?.map(c => c.id === col.id ? { ...c, blocks: newSubBlocks } : c)
                                                    } : b));
                                                }}
                                                draggedBlockIndex={draggedBlockIndex}
                                                setDraggedBlockIndex={setDraggedBlockIndex}
                                                createNewBlock={createNewBlock}
                                                onImageDoubleClick={onImageDoubleClick}
                                                createAndFocusBlock={createAndFocusBlock}
                                                focusedBlockId={focusedBlockId}
                                                setFocusedBlockId={setFocusedBlockId}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-4 flex gap-1 flex-wrap opacity-0 group-hover/col:opacity-100 transition-opacity">
                                        {[
                                            { type: 'text', label: 'T' },
                                            { type: 'h1', label: 'H1' },
                                            { type: 'h2', label: 'H2' },
                                            { type: 'h3', label: 'H3' },
                                            { type: 'image', label: 'Img' },
                                            { type: 'todo', label: '✓' },
                                            { type: 'bullet', label: '•' },
                                            { type: 'number', label: '1.' },
                                            { type: 'table', label: 'Tab' },
                                            { type: 'code', label: '<>' },
                                            { type: 'quote', label: '"' },
                                            { type: 'callout', label: '!' }
                                        ].map(opt => (
                                            <button
                                                key={opt.type}
                                                onClick={() => {
                                                    const newB = createNewBlock(opt.type as Block['type']);
                                                    setParentBlocks(parentBlocks.map(b => b.id === block.id ? {
                                                        ...b,
                                                        columns: b.columns?.map(c => c.id === col.id ? { ...c, blocks: [...c.blocks, newB] } : c)
                                                    } : b));
                                                }}
                                                className="p-1 px-1.5 border border-dashed border-[#ececeb] rounded hover:bg-gray-100 text-[9px] font-bold text-[#91918e] min-w-[24px]"
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-2">
                            {(!block.columns || block.columns.length < 5) && (
                                <button
                                    onClick={() => {
                                        const newCol = { id: Math.random().toString(36).substr(2, 9), blocks: [createNewBlock('text')] };
                                        setParentBlocks(parentBlocks.map(b => b.id === block.id ? { ...b, columns: [...(b.columns || []), newCol] } : b));
                                    }}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 p-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center gap-1"
                                >
                                    <Plus size={10} /> Ajouter une colonne ({block.columns?.length || 0}/5)
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    renderBlockContent(
                        block,
                        (content) => {
                            setParentBlocks(parentBlocks.map(b => b.id === block.id ? { ...b, content } : b));
                        },
                        (checked) => {
                            setParentBlocks(parentBlocks.map(b => b.id === block.id ? { ...b, checked } : b));
                        },
                        (tableData) => {
                            setParentBlocks(parentBlocks.map(b => b.id === block.id ? { ...b, tableData } : b));
                        },
                        () => createAndFocusBlock(block.type, index, parentBlocks, setParentBlocks),
                        () => {
                            if (block.content === '' && ['bullet', 'number', 'todo'].includes(block.type)) {
                                setParentBlocks(parentBlocks.map(b => b.id === block.id ? { ...b, type: 'text' } : b));
                            }
                        },
                        getBulletNumber(block, parentBlocks),
                        onImageDoubleClick,
                        textareaRef
                    ))}
            </div>
        </div>
    );
};

const renderBlockContent = (
    block: Block,
    onChange: (content: string) => void,
    onToggle?: (checked: boolean) => void,
    onTableChange?: (data: string[][]) => void,
    onEnter?: () => void,
    onBackspace?: () => void,
    bulletNumber: number = 1,
    onImageDoubleClick?: (src: string) => void,
    textareaRef?: React.RefObject<any>
) => {
    const sizeClass = block.fontSize === 'sm' ? 'text-sm' :
        block.fontSize === 'lg' ? 'text-lg' :
            block.fontSize === 'xl' ? 'text-xl' :
                block.fontSize === '2xl' ? 'text-2xl' :
                    block.fontSize === '3xl' ? 'text-3xl' : 'text-base';

    const commonClasses = `w-full bg-transparent outline-none border-none resize-none overflow-hidden placeholder:opacity-50 transition-all ${sizeClass}`;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter?.();
        } else if (e.key === 'Backspace' && block.content === '') {
            onBackspace?.();
        }
    };

    switch (block.type) {
        case 'h1':
            return <input ref={textareaRef} type="text" value={block.content} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Titre 1" className={`w-full bg-transparent outline-none border-none placeholder:opacity-50 transition-all text-5xl font-black text-[#37352f] dark:text-[#ebebeb] py-4`} />;
        case 'h2':
            return <input ref={textareaRef} type="text" value={block.content} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Titre 2" className={`w-full bg-transparent outline-none border-none placeholder:opacity-50 transition-all text-4xl font-extrabold text-[#37352f] dark:text-[#ebebeb] py-3`} />;
        case 'h3':
            return <input ref={textareaRef} type="text" value={block.content} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Titre 3" className={`w-full bg-transparent outline-none border-none placeholder:opacity-50 transition-all text-3xl font-bold text-[#37352f] dark:text-[#ebebeb] py-2`} />;
        case 'text':
            return (
                <textarea
                    ref={textareaRef}
                    value={block.content}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Commencez à écrire..."
                    className={`${commonClasses} text-base py-1 leading-relaxed`}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                    }}
                />
            );
        case 'quote':
            return (
                <div className="flex gap-4 border-l-4 border-indigo-500 pl-4 py-2 italic text-[#37352f]/80 dark:text-[#ebebeb]/80 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-r-lg">
                    <textarea ref={textareaRef} value={block.content} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Citation..." className={commonClasses} />
                </div>
            );
        case 'divider':
            return <div className="py-4"><div className="h-[1px] bg-[#ececeb] dark:bg-[#2f2f2f] w-full" /></div>;
        case 'todo':
            return (
                <div className="flex items-start gap-2 py-1">
                    <input type="checkbox" checked={block.checked} onChange={e => onToggle?.(e.target.checked)} className="mt-1.5 w-4 h-4 rounded border-[#ececeb] accent-indigo-600" />
                    <textarea ref={textareaRef} value={block.content} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Tâche..." className={`${commonClasses} ${block.checked ? 'line-through opacity-50' : ''}`} />
                </div>
            );
        case 'bullet':
            return (
                <div className="flex items-start gap-2 py-1">
                    <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#37352f] dark:bg-[#ebebeb] flex-shrink-0" />
                    <textarea ref={textareaRef} value={block.content} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Élément..." className={commonClasses} />
                </div>
            );
        case 'number':
            return (
                <div className="flex items-start gap-2 py-1">
                    <span className="mt-1 text-sm font-bold text-[#91918e] min-w-[20px]">{bulletNumber}.</span>
                    <textarea ref={textareaRef} value={block.content} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Élément..." className={commonClasses} />
                </div>
            );
        case 'callout':
            return (
                <div className="flex gap-3 p-4 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl">
                    <AlertCircle className="text-orange-500 shrink-0" size={20} />
                    <textarea value={block.content} onChange={e => onChange(e.target.value)} placeholder="Alerte..." className={commonClasses} />
                </div>
            );
        case 'image':
            const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await api.post('/upload', formData);
                    onChange(response.data.url);
                } catch (err) {
                    console.error("Upload failed", err);
                    alert("Erreur lors de l'upload de l'image");
                }
            };

            return (
                <div className="my-4 space-y-4">
                    <div className="p-8 border-2 border-dashed border-[#ececeb] dark:border-[#2f2f2f] rounded-2xl text-center bg-[#fbfbfa] dark:bg-[#1e1e1e] group/img">
                        <ImageIcon size={32} className="mx-auto text-[#91918e] mb-4" />

                        <div className="flex flex-col items-center gap-4">
                            <label className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-lg shadow-indigo-500/20">
                                <Upload size={14} />
                                Choisir un fichier
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>

                            <div className="w-full flex items-center gap-2 px-12">
                                <div className="h-[1px] bg-[#ececeb] flex-1" />
                                <span className="text-[10px] font-bold text-[#91918e] uppercase">Ou</span>
                                <div className="h-[1px] bg-[#ececeb] flex-1" />
                            </div>

                            <input
                                type="text"
                                value={block.content}
                                onChange={e => onChange(e.target.value)}
                                placeholder="Coller le lien d'une image..."
                                className="w-full max-w-md bg-white dark:bg-[#191919] border border-[#ececeb] dark:border-[#2f2f2f] rounded-lg px-4 py-2 text-sm text-center outline-none focus:border-indigo-600 transition-all"
                            />
                        </div>
                    </div>
                    {block.content && (
                        <div className="relative group/preview mt-4">
                            <img
                                src={block.content}
                                className="max-w-full rounded-2xl shadow-2xl mx-auto cursor-zoom-in hover:opacity-95 transition-opacity"
                                alt=""
                                onDoubleClick={() => onImageDoubleClick?.(block.content)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange('');
                                    }}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all pointer-events-auto"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        case 'video':
            return (
                <div className="my-4 text-center p-8 border-2 border-[#ececeb] dark:border-[#2f2f2f] rounded-2xl bg-[#000]/5">
                    <Video size={32} className="mx-auto text-indigo-500 mb-4" />
                    <input type="text" value={block.content} onChange={e => onChange(e.target.value)} placeholder="Lien Vidéo" className="w-full bg-white dark:bg-[#191919] border border-[#ececeb] dark:border-[#2f2f2f] rounded-lg px-4 py-2 text-sm text-center" />
                </div>
            );
        case 'code':
            return (
                <div className="my-4 bg-[#1e1e1e] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[#333]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Snippet de Code</span>
                    </div>
                    <textarea
                        value={block.content}
                        onChange={e => onChange(e.target.value)}
                        className="w-full p-6 font-mono text-sm text-indigo-300 bg-transparent outline-none h-48 resize-y"
                    />
                </div>
            );
        case 'table':
            return (
                <div className="my-8 overflow-hidden rounded-xl border border-[#ececeb] dark:border-[#2f2f2f]">
                    <div className="bg-[#fbfbfa] dark:bg-[#1f1f1f] p-2 border-b border-[#ececeb] dark:border-[#2f2f2f] flex gap-2">
                        <button
                            onClick={() => {
                                const newData = block.tableData?.map(row => [...row, '']) || [['', '']];
                                onTableChange?.(newData);
                            }}
                            className="text-[10px] font-bold p-1 px-2 border border-[#ececeb] rounded hover:bg-white"
                        >+ Colonne</button>
                        <button
                            onClick={() => {
                                const newRow = Array((block.tableData?.[0] || ['', '']).length).fill('');
                                const newData = [...(block.tableData || [['', '']]), newRow];
                                onTableChange?.(newData);
                            }}
                            className="text-[10px] font-bold p-1 px-2 border border-[#ececeb] rounded hover:bg-white"
                        >+ Ligne</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <tbody>
                                {block.tableData?.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-[#ececeb] dark:border-[#2f2f2f] last:border-0">
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="border-r border-[#ececeb] dark:border-[#2f2f2f] last:border-0 p-0 min-w-[120px]">
                                                <textarea
                                                    value={cell}
                                                    onChange={(e) => {
                                                        const newData = [...(block.tableData || [])];
                                                        newData[rIdx][cIdx] = e.target.value;
                                                        onTableChange?.(newData);
                                                    }}
                                                    className="w-full h-full p-3 bg-transparent outline-none border-none resize-none min-h-[46px] text-sm"
                                                    rows={1}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        default:
            return null;
    }
}

export default WikiEditor;
