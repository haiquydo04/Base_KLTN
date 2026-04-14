import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminCategoryService } from '../services/api';

// Custom Icons for Category Management
const Icons = {
    Plus: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    ),
    Palette: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
    ),
    Dumbbell: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m14.4 14.4 5.6 5.6"></path><path d="m3.6 3.6 5.6 5.6"></path><path d="m14 20.4-6.4-6.4"></path><path d="m10 24-4-4"></path><path d="M4 14 0 10"></path><path d="m10 4 4-4"></path><path d="m20 10 4 4"></path><path d="m24 14-4 4"></path><path d="m14.4 9.6-4.8 4.8"></path></svg>
    ),
    Wine: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 22h8"></path><path d="M7 10h10"></path><path d="M12 15v7"></path><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"></path></svg>
    ),
    Burger: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 16h19"></path><path d="M2 12c0-3 2.5-6 6-6h8c3.5 0 6 3 6 6v2H2v-2Z"></path><path d="M2.5 16a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2"></path><path d="M12 2v4"></path><path d="M16 2v4"></path><path d="M8 2v4"></path></svg>
    ),
    Paw: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22a7.1 7.1 0 0 1-7-8 7.1 7.1 0 0 1 14 0 7.1 7.1 0 0 1-7 8Z"></path><path d="M6 10a2 2 0 0 1-2-2 2 2 0 0 1 4 0 2 2 0 0 1-2 2Z"></path><path d="M18 10a2 2 0 0 1-2-2 2 2 0 0 1 4 0 2 2 0 0 1-2 2Z"></path><path d="M14.5 4.5a2 2 0 0 1-4 0 2 2 0 0 1 4 0Z"></path></svg>
    ),
    Edit: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
    ),
    Eye: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    ),
    EyeOff: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
    ),
    Trash: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
    ),
    ChevronLeft: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"></path></svg>
    ),
    ChevronRight: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"></path></svg>
    ),
    Shapes: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"></path><rect x="3" y="14" width="7" height="7" rx="1"></rect><circle cx="17.5" cy="17.5" r="3.5"></circle></svg>
    ),
    TrendingUp: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
    ),
    Sparkles: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
    )
};

const TAB_MAPPING = {
    'Sở thích': 'interest',
    'Nghề nghiệp': 'occupation',
    'Địa điểm': 'location',
    'Chung': 'general'
};

const getIconForCategory = (name) => {
    if (!name) return Icons.Shapes;
    const lower = name.toLowerCase();
    if (lower.includes('nghệ') || lower.includes('vẽ')) return Icons.Palette;
    if (lower.includes('thể thao') || lower.includes('gym')) return Icons.Dumbbell;
    if (lower.includes('tiệc') || lower.includes('rượu')) return Icons.Wine;
    if (lower.includes('ẩm thực') || lower.includes('ăn')) return Icons.Burger;
    if (lower.includes('thú cưng')) return Icons.Paw;
    return Icons.Shapes;
};

const getColorForCategory = (index) => {
    const colors = [
        'text-rose-500 bg-rose-50',
        'text-blue-500 bg-blue-50',
        'text-emerald-500 bg-emerald-50',
        'text-amber-500 bg-amber-50',
        'text-purple-500 bg-purple-50'
    ];
    return colors[index % colors.length];
};

export default function CategoryManagement() {
    const tabs = ['Sở thích', 'Nghề nghiệp', 'Địa điểm', 'Chung'];
    const [activeTab, setActiveTab] = useState('Sở thích');
    
    // API States
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: 'fa-star' });

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminCategoryService.getCategories({
                category: TAB_MAPPING[activeTab],
                page,
                limit
            });
            if (res.success) {
                setCategories(res.data || []);
                setTotalPages(res.pagination?.pages || 1);
                setTotal(res.pagination?.total || 0);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, limit]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    const handleToggleStatus = async (id) => {
        try {
            const res = await adminCategoryService.toggleStatus(id);
            if (res.success) {
                // Update local state directly
                setCategories(prev => prev.map(cat => cat._id === id ? { ...cat, status: res.data?.status || (cat.status === 'active' ? 'hidden' : 'active') } : cat));
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đổi trạng thái');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này? LƯU Ý: Không thể xóa nếu đã có người dùng sử dụng.')) return;
        try {
            const res = await adminCategoryService.deleteCategory(id);
            if (res.success) {
                fetchCategories();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể xóa danh mục này');
        }
    };

    const openModal = (cat = null) => {
        if (cat) {
            setEditItem(cat);
            setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || 'fa-star' });
        } else {
            setEditItem(null);
            setFormData({ name: '', description: '', icon: 'fa-star' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return alert('Vui lòng nhập tên danh mục');
        try {
            let res;
            if (editItem) {
                // Update
                res = await adminCategoryService.updateCategory(editItem._id, formData);
            } else {
                // Create
                const payload = { ...formData, category: TAB_MAPPING[activeTab] };
                res = await adminCategoryService.createCategory(payload);
            }
            if (res.success) {
                setIsModalOpen(false);
                fetchCategories();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi lưu danh mục');
        }
    };

    return (
        <AdminLayout title="Quản lý Danh mục" noPadding={true}>
            <div className="flex flex-col h-full bg-[#FAFAFA]">

                {/* Main Content Area */}
                <div className="flex-1 px-10 py-10">

                    {/* Header Section */}
                    <div className="flex justify-end items-start mb-8">
                        <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#E53258] hover:bg-[#D42247] transition-colors text-white px-6 py-3.5 rounded-full font-bold shadow-lg shadow-rose-200">
                            <Icons.Plus />
                            <span>Thêm danh mục mới</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-full text-[14px] font-bold transition-all ${activeTab === tab
                                        ? 'bg-[#B21C3A] text-white shadow-md'
                                        : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100 shadow-sm'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-2 mb-10 border border-gray-100/50">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr>
                                    <th className="pb-4 pt-6 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[35%] pl-8">Tên danh mục</th>
                                    <th className="pb-4 pt-6 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[15%]">Nhóm</th>
                                    <th className="pb-4 pt-6 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[15%]">Trạng thái</th>
                                    <th className="pb-4 pt-6 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[15%]">Sử dụng</th>
                                    <th className="pb-4 pt-6 text-[12px] font-black tracking-[0.1em] text-[#A19D9F] uppercase w-[20%] text-right pr-12">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/80">
                                {loading ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                                ) : categories.length === 0 ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-gray-400">Chưa có danh mục nào trong nhóm này.</td></tr>
                                ) : categories.map((cat, index) => {
                                    const IconComponent = getIconForCategory(cat.name);
                                    return (
                                        <tr key={cat._id} className={`hover:bg-[#FCFAFA] transition-colors group ${cat.status === 'hidden' ? 'opacity-60' : ''}`}>
                                            <td className="py-5 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorForCategory(index)}`}>
                                                        <IconComponent />
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-[15px]">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 text-gray-500 text-[14px] font-medium">{activeTab}</td>
                                            <td className="py-5">
                                                {cat.status === 'active' ? (
                                                    <span className="px-3 py-1 bg-[#E8FFF0] text-[#10B981] border border-[#A7F3D0]/0 rounded-full text-[10px] font-extrabold tracking-wider whitespace-nowrap">ĐANG HOẠT ĐỘNG</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-[#F4EFEF] text-[#988C91] rounded-full text-[10px] font-extrabold tracking-wider whitespace-nowrap">ĐÃ ẨN</span>
                                                )}
                                            </td>
                                            <td className="py-5 text-gray-900 text-[14px] font-bold">
                                                {cat.usageCount || 0}
                                            </td>
                                            <td className="py-5 text-right pr-12">
                                                <div className="flex items-center justify-end gap-5">
                                                    <button onClick={() => openModal(cat)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Chỉnh sửa">
                                                        <Icons.Edit />
                                                    </button>
                                                    {cat.status === 'active' ? (
                                                        <button onClick={() => handleToggleStatus(cat._id)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Ẩn danh mục">
                                                            <Icons.Eye />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleToggleStatus(cat._id)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Hiện danh mục">
                                                            <Icons.EyeOff />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(cat._id)} className="text-[#FF9B9B] hover:text-[#E53258] transition-colors" title="Xóa danh mục">
                                                        <Icons.Trash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination block */}
                        {totalPages > 0 && (
                            <div className="flex justify-between items-center mt-2 px-8 pb-6 pt-4 border-t border-gray-50">
                                <span className="text-[13px] text-gray-500 font-bold tracking-wide">
                                    Trang {page} của {totalPages} (Tổng: {total})
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30">
                                        <Icons.ChevronLeft />
                                    </button>
                                    
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const p = i + 1;
                                        if (p < page - 1 || p > page + 1) {
                                            if (p === 1 || p === totalPages) {
                                                return (
                                                    <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                                        {p}
                                                    </button>
                                                )
                                            }
                                            if (p === page - 2 || p === page + 2) {
                                                return <span key={p} className="w-8 h-8 flex items-center justify-center font-bold text-gray-400">...</span>
                                            }
                                            return null;
                                        }
                                        return (
                                            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${page === p ? 'bg-[#B21C3A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                                                {p}
                                            </button>
                                        )
                                    })}

                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30">
                                        <Icons.ChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Card 1 */}
                        <div className="bg-white rounded-[32px] p-8 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50">
                            <div className="w-14 h-14 rounded-full bg-[#FFF0F3] text-[#E53258] flex items-center justify-center">
                                <Icons.Shapes />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tổng danh mục</div>
                                <div className="text-4xl font-black text-gray-900 leading-none">{total || 0}</div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-[32px] p-8 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50">
                            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                                <Icons.TrendingUp />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Trạng thái API</div>
                                <div className="text-3xl font-black text-gray-900 leading-none text-[#10B981]">Online</div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white rounded-[32px] p-8 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50">
                            <div className="w-14 h-14 rounded-full bg-[#F0F5FF] text-[#3B82F6] flex items-center justify-center">
                                <Icons.Sparkles />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Gợi ý từ AI</div>
                                <div className="text-4xl font-black text-gray-900 leading-none">12</div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
                            <Icons.Plus className="w-7 h-7 rotate-45" />
                        </button>
                        
                        <h3 className="text-[22px] font-black text-gray-900 mb-8 tracking-tight">
                            {editItem ? 'Chỉnh sửa Danh mục' : `Thêm danh mục mới - ${activeTab}`}
                        </h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Tên danh mục <span className="text-[#E53258]">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    className="w-full px-5 py-3.5 bg-[#F9F8F8] border border-gray-200/60 rounded-2xl outline-none focus:border-[#E53258] focus:bg-white transition-all text-[15px] text-gray-900 font-medium placeholder-gray-400" 
                                    placeholder="Ví dụ: Đọc sách, Thể thao, Hội họa..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Mô tả ngắn</label>
                                <textarea 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    className="w-full px-5 py-3.5 bg-[#F9F8F8] border border-gray-200/60 rounded-2xl outline-none focus:border-[#E53258] focus:bg-white transition-all text-[15px] text-gray-900 font-medium placeholder-gray-400 min-h-[100px] resize-none" 
                                    placeholder="Viết mô tả ngắn cho danh mục này..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-7 py-3 rounded-full text-gray-500 font-bold hover:bg-gray-100 hover:text-gray-900 transition-colors text-[14px]">
                                Hủy bỏ
                            </button>
                            <button onClick={handleSave} className="px-8 py-3 rounded-full bg-[#E53258] text-white font-bold hover:bg-[#D42247] shadow-lg shadow-rose-200 transition-colors text-[14px]">
                                {editItem ? 'Cập nhật' : 'Thêm danh mục'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
