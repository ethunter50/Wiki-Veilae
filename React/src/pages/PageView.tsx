import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Clock,
    User as UserIcon,
    AlertCircle,
    CheckSquare,
    Video,
    FileText,
    X
} from 'lucide-react';
import api from '../lib/axios';

export interface Block {
    id: string;
    type: 'text' | 'h1' | 'h2' | 'h3' | 'image' | 'code' | 'quote' | 'divider' | 'callout' | 'todo' | 'bullet' | 'number' | 'video' | 'columns' | 'table';
    content: string;
    checked?: boolean;
    columns?: { id: string, blocks: Block[] }[];
    tableData?: string[][];
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
}

interface PageData {
    id: number;
    title: string;
    content: Block[];
    updated_at: string;
    user?: {
        username: string;
    };
}

const PageView = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/pages/${slug}`);
                setPage(response.data);
            } catch (err) {
                console.error("Failed to fetch page", err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#fbfbfa] dark:bg-[#191919]">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#fbfbfa] dark:bg-[#191919] text-[#37352f] dark:text-[#d3d3d3]">
                <FileText size={48} className="mb-4 opacity-20" />
                <h2 className="text-2xl font-bold mb-2">Page introuvable</h2>
                <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Retour à l'accueil</button>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(new Date(dateString));
    };

    return (
        <div className="w-full min-h-screen bg-white dark:bg-[#191919] animate-in fade-in duration-700">
            <div className="max-w-[1400px] mx-auto py-20 px-10">
                <header className="mb-12">
                    <div className="flex items-center gap-4 text-sm text-[#91918e] mb-8">
                        <button onClick={() => navigate(-1)} className="hover:text-[#37352f] dark:hover:text-[#d3d3d3] flex items-center gap-1 transition-colors">
                            <ChevronLeft size={16} /> Retour
                        </button>
                        <span className="opacity-30">|</span>
                        <div className="flex items-center gap-1">
                            <UserIcon size={14} /> {page.user?.username}
                        </div>
                        <span className="opacity-30">•</span>
                        <div className="flex items-center gap-1">
                            <Clock size={14} /> {formatDate(page.updated_at)}
                        </div>
                    </div>

                    <h1 className="text-5xl font-black text-[#37352f] dark:text-[#ebebeb] mb-6 tracking-tight leading-tight">
                        {page.title}
                    </h1>
                </header>

                <article className="pb-40">
                    {page.content?.map((block, idx) => {
                        const isList = ['bullet', 'number', 'todo'].includes(block.type);
                        const nextIsList = page.content?.[idx + 1] && ['bullet', 'number', 'todo'].includes(page.content[idx + 1].type);
                        return (
                            <div key={block.id} className={`w-full ${isList && nextIsList ? 'mb-1' : 'mb-6'}`}>
                                {renderReadOnlyBlock(block, page.content, (src) => setSelectedImage(src))}
                            </div>
                        );
                    })}
                </article>

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
        </div>
    );
};

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

export const renderReadOnlyBlock = (block: Block, parentBlocks: Block[] = [], onImageDoubleClick?: (src: string) => void) => {
    const sizeClass = block.fontSize === 'sm' ? 'text-sm' :
        block.fontSize === 'lg' ? 'text-lg' :
            block.fontSize === 'xl' ? 'text-xl' :
                block.fontSize === '2xl' ? 'text-2xl' :
                    block.fontSize === '3xl' ? 'text-3xl' : 'text-base';

    switch (block.type) {
        case 'h1':
            return <h1 className={`text-[#37352f] dark:text-[#ebebeb] mt-10 mb-6 tracking-tight leading-tight ${block.fontSize ? sizeClass : 'text-5xl font-black'}`}>{block.content}</h1>;
        case 'h2':
            return <h2 className={`text-[#37352f] dark:text-[#ebebeb] mt-8 mb-4 tracking-tight leading-tight ${block.fontSize ? sizeClass : 'text-4xl font-extrabold'}`}>{block.content}</h2>;
        case 'h3':
            return <h3 className={`text-[#37352f] dark:text-[#ebebeb] mt-6 mb-3 tracking-tight ${block.fontSize ? sizeClass : 'text-3xl font-bold'}`}>{block.content}</h3>;
        case 'text':
            return <p className={`leading-relaxed text-[#37352f] dark:text-[#d3d3d3] opacity-90 whitespace-pre-wrap ${sizeClass}`}>{block.content}</p>;
        case 'quote':
            return (
                <blockquote className={`border-l-4 border-indigo-500 pl-6 py-4 my-6 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-r-2xl italic text-[#37352f]/90 dark:text-[#d3d3d3]/90 ${block.fontSize ? sizeClass : 'text-xl'}`}>
                    {block.content}
                </blockquote>
            );
        case 'divider':
            return <hr className="my-10 border-[#ececeb] dark:border-[#2f2f2f]" />;
        case 'todo':
            return (
                <div className="flex items-start gap-3 py-1">
                    <div className={`mt-1.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${block.checked ? 'bg-indigo-600 border-indigo-600' : 'border-[#ececeb] dark:border-[#2f2f2f]'}`}>
                        {block.checked && <CheckSquare size={14} className="text-white" />}
                    </div>
                    <span className={`${sizeClass} ${block.checked ? 'line-through opacity-50' : 'text-[#37352f] dark:text-[#d3d3d3]'}`}>
                        {block.content}
                    </span>
                </div>
            );
        case 'bullet':
            return (
                <div className="flex items-start gap-4 py-1.5">
                    <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    <span className={`text-[#37352f] dark:text-[#d3d3d3] opacity-90 ${sizeClass}`}>{block.content}</span>
                </div>
            );
        case 'number':
            return (
                <div className={`flex items-start gap-4 py-1.5 ${sizeClass}`}>
                    <span className="font-bold text-indigo-500 min-w-[20px]">{getBulletNumber(block, parentBlocks)}.</span>
                    <span className="text-[#37352f] dark:text-[#d3d3d3] opacity-90">{block.content}</span>
                </div>
            );
        case 'callout':
            return (
                <div className="flex gap-4 p-6 my-6 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-2xl">
                    <AlertCircle className="text-orange-500 shrink-0" size={24} />
                    <p className="text-[#37352f] dark:text-[#d3d3d3] font-medium leading-relaxed">{block.content}</p>
                </div>
            );
        case 'image':
            return (
                <figure className="my-10">
                    <img
                        src={block.content}
                        className="w-full rounded-2xl shadow-xl cursor-zoom-in hover:opacity-95 transition-opacity"
                        alt="Content"
                        onDoubleClick={() => onImageDoubleClick?.(block.content)}
                    />
                </figure>
            );
        case 'video':
            return (
                <div className="my-10 aspect-video rounded-2xl overflow-hidden shadow-xl bg-black flex items-center justify-center">
                    <Video size={48} className="text-white/20" />
                </div >
            );
        case 'code':
            return (
                <div className="my-8 rounded-2xl overflow-hidden shadow-lg border border-[#333]">
                    <div className="bg-[#252525] px-4 py-2 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                        </div>
                    </div>
                    <pre className="p-6 bg-[#1e1e1e] text-indigo-300 font-mono text-base overflow-x-auto custom-scrollbar">
                        <code>{block.content}</code>
                    </pre>
                </div>
            );
        case 'columns':
            return (
                <div className="flex gap-8 my-8 flex-wrap md:flex-nowrap">
                    {block.columns?.map((col) => (
                        <div key={col.id} className="flex-1 space-y-4">
                            {col.blocks.map(subBlock => (
                                <div key={subBlock.id}>{renderReadOnlyBlock(subBlock, col.blocks, onImageDoubleClick)}</div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        case 'table':
            return (
                <div className="my-8 overflow-hidden rounded-2xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <tbody>
                                {block.tableData?.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-[#ececeb] dark:border-[#2f2f2f] last:border-0">
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="border-r border-[#ececeb] dark:border-[#2f2f2f] last:border-0 p-4 min-w-[120px] text-sm text-[#37352f] dark:text-[#d3d3d3] opacity-90 whitespace-pre-wrap">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

export default PageView;
