import React, { useState, useEffect } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Plus,
    FileText,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    LogOut,
    ShieldCheck,
    Users as UsersIcon,
    Home,
    LayoutGrid,
    ListTree
} from 'lucide-react';
import api from '../lib/axios';




interface PageItem {
    id: string;
    title: string;
    slug: string;
    icon?: string;
    order?: number;
    children?: PageItem[]; // Pages can have children (sub-pages)
    isOpen?: boolean;
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    order?: number;
    all_children?: CategoryItem[];
    pages?: PageItem[];
}

interface SidebarProps {
    user: any;
    onLogout: () => void;
}

const Sidebar = ({ user, onLogout }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdminView = location.pathname.startsWith('/admin');

    const [pages, setPages] = useState<PageItem[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const [pagesRes, catsRes] = await Promise.all([
                    api.get('/pages'),
                    api.get('/categories')
                ]);

                // Filter pages to only show root pages (no category) 
                // and no parent_id if hierarchical pages are used
                const rootPages = pagesRes.data.filter((p: any) => !p.category_id && !p.parent_id);
                setPages(rootPages);
                setCategories(catsRes.data);
            } catch (err) {
                console.error("Failed to fetch sidebar data", err);
            }
        };
        fetchSidebarData();
    }, [location.pathname]); // Refresh when navigating

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <aside className="w-64 h-screen bg-[#fbfbfa] dark:bg-[#191919] border-r border-[#ececeb] dark:border-[#2f2f2f] flex flex-col transition-all duration-300 ease-in-out select-none relative">
            {/* Header / User Profile */}
            <div
                className="relative px-3 py-2 mt-1 mx-1 rounded-lg hover:bg-[#efefed] dark:hover:bg-[#252525] cursor-pointer transition-colors"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold ${user?.role === 'admin' ? 'bg-indigo-600' : user?.role === 'documentaliste' ? 'bg-amber-500' : 'bg-green-600'}`}>
                            {user?.username?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#37352f] dark:text-[#d3d3d3] truncate">
                            {user?.username}
                        </span>
                    </div>
                    <ChevronDown size={14} className={`text-[#91918e] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in duration-150">
                        <div className="flex flex-col gap-0.5">

                            <div
                                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 text-sm text-red-600 dark:text-red-400 cursor-pointer"
                                onClick={onLogout}
                            >
                                <LogOut size={14} /> Déconnexion
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                {isAdminView ? (
                    // ADMIN VIEW: ONLY ADMINISTRATION ACTIONS
                    <div className="mt-2 flex flex-col gap-0.5 animate-in fade-in duration-300">
                        {user.role === 'admin' && (
                            <>
                                <div className="px-3 mb-2 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-[#91918e] uppercase tracking-wider">Administration</span>
                                </div>
                                <Link to="/admin">
                                    <SidebarAction icon={<ShieldCheck size={18} />} label="Centre de Contrôle" />
                                </Link>
                                <Link to="/admin/users">
                                    <SidebarAction icon={<UsersIcon size={18} />} label="Utilisateurs" />
                                </Link>
                            </>
                        )}


                        <div className="px-3 mt-6 mb-2 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#91918e] uppercase tracking-wider">Gestion Wiki</span>
                        </div>
                        <Link to="/admin/pages">
                            <SidebarAction icon={<FileText size={18} />} label="Management des pages" />
                        </Link>
                        {(user.role === 'admin' || user.role === 'documentaliste') && (
                            <>
                                <Link to="/admin/categories">
                                    <SidebarAction icon={<LayoutGrid size={18} />} label="Catégories" />
                                </Link>
                                <Link to="/admin/global">
                                    <SidebarAction icon={<ListTree size={18} />} label="Organisation Globale" />
                                </Link>
                            </>
                        )}

                    </div>

                ) : (
                    // USER VIEW: WIKI ACTIONS + PAGES
                    <div className="animate-in fade-in duration-300">
                        <div className="mt-2 flex flex-col gap-0.5">
                            <Link to="/">
                                <SidebarAction icon={<Home size={18} />} label="Accueil" />
                            </Link>
                        </div>

                        <div className="mt-6 flex flex-col">
                            <div className="px-3 mb-2 flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-[#91918e] uppercase tracking-wider">Navigation</span>
                            </div>

                            <div className="space-y-0.5 outline-none">
                                <div className="space-y-0.5 outline-none">
                                    {/* Mixed Root Items sorted by order */}
                                    {[...categories, ...pages]
                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                        .map(item => {
                                            if ('name' in item) {
                                                return <CategoryLink key={`cat-${item.id}`} category={item as CategoryItem} depth={0} user={user} />;
                                            } else {
                                                return <PageLink key={`page-${item.id}`} page={item as PageItem} depth={0} user={user} />;
                                            }
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Footer */}
            <div className="mt-auto p-2 border-t border-[#ececeb] dark:border-[#2f2f2f] flex flex-col gap-0.5">
                {(user.role === 'admin' || user.role === 'documentaliste') && (
                    <div
                        onClick={() => navigate(isAdminView ? '/' : '/admin')}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 mb-1"
                    >
                        {isAdminView ? (
                            <><FileText size={18} /> Vue Wiki (User)</>
                        ) : (
                            <><ShieldCheck size={18} /> Vue Admin</>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};

const SidebarAction = ({ icon, label, primary = false }: { icon: React.ReactNode, label: string, primary?: boolean }) => (
    <div className={`
    flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm
    ${primary ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-[#37352f] dark:text-[#d3d3d3]'}
    hover:bg-[#efefed] dark:hover:bg-[#252525]
  `}>
        <span className="flex-shrink-0">{icon}</span>
        <span>{label}</span>
    </div>
);

const PageLink = ({ page, depth, user }: { page: PageItem, depth: number, user: any }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = page.children && page.children.length > 0;

    return (
        <div>
            <div
                className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-[#efefed] dark:hover:bg-[#252525] transition-colors text-sm text-[#37352f] dark:text-[#d3d3d3]"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => {
                    if (hasChildren) {
                        setIsOpen(!isOpen);
                    } else {
                        navigate(`/pages/${page.slug}`);
                    }
                }}
            >
                <span className="flex-shrink-0 text-[#91918e]">
                    {hasChildren ? (
                        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : (
                        <div className="w-3.5" />
                    )}
                </span>
                <span className="flex-shrink-0 opacity-70"><FileText size={16} /></span>
                <span className="truncate flex-1">{page.title}</span>
                {(user.role === 'admin' || user.role === 'documentaliste') && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[#91918e] transition-opacity">
                        <Plus
                            size={14}
                            className="hover:bg-[#dfdfde] dark:hover:bg-[#2f2f2f] rounded p-0.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/admin/pages/create');
                            }}
                        />
                        <MoreHorizontal size={14} className="hover:bg-[#dfdfde] dark:hover:bg-[#2f2f2f] rounded p-0.5" />
                    </div>
                )}
            </div>

            {isOpen && hasChildren && (
                <div className="mt-0.5">
                    {page.children?.map(child => (
                        <PageLink key={child.id} page={child} depth={depth + 1} user={user} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoryLink = ({ category, depth, user }: { category: CategoryItem, depth: number, user: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubCats = category.all_children && category.all_children.length > 0;
    const hasPages = category.pages && category.pages.length > 0;
    const hasContent = hasSubCats || hasPages;

    return (
        <div>
            <div
                className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-[#efefed] dark:hover:bg-[#252525] transition-colors text-sm font-semibold text-[#37352f] dark:text-[#d3d3d3]"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex-shrink-0 text-[#91918e]">
                    {hasContent ? (
                        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : (
                        <div className="w-3.5" />
                    )}
                </span>
                <span className="flex-shrink-0 text-indigo-500 opacity-80"></span>
                {/* <span className="flex-shrink-0 text-indigo-500 opacity-80"><Folder size={16} /></span> */}
                <span className="truncate flex-1">{category.name}</span>
            </div>

            {isOpen && (
                <div className="mt-0.5">
                    <div className="mt-0.5">
                        {/* Render mixed children (subcats and pages) sorted by order */}
                        {[...(category.all_children || []), ...(category.pages || [])]
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map(item => {
                                if ('name' in item) {
                                    return <CategoryLink key={`subcat-${item.id}`} category={item as CategoryItem} depth={depth + 1} user={user} />;
                                } else {
                                    return <PageLink key={`page-${item.id}`} page={item as PageItem} depth={depth + 1} user={user} />;
                                }
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};

// const Folder = ({ size, className }: { size: number, className?: string }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//         <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
//     </svg>
// );

export default Sidebar;
