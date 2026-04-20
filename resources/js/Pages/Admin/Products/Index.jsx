import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function ProductIndex({ products, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        platform: 'Walmart',
        product_url: '',
        target_keyword: '',
        price: '',
        compare_at_price: '',
        sku: '',
        stock_quantity: 0,
        description: '',
        image: null,
        status: 'published',
    });

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setData({
                title: product.title,
                platform: product.platform,
                product_url: product.product_url || '',
                target_keyword: product.target_keyword || '',
                price: product.price,
                compare_at_price: product.compare_at_price || '',
                sku: product.sku || '',
                stock_quantity: product.stock_quantity,
                description: product.description || '',
                status: product.status,
                image: null,
            });
        } else {
            setEditingProduct(null);
            reset();
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingProduct) {
            router.post(route('admin.products.update', editingProduct.id), {
                _method: 'PATCH',
                ...data
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.products.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteProduct = (id) => {
        Swal.fire({
            title: 'Delete Product?',
            text: "Are you sure you want to delete this product? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Delete',
            background: '#ffffff',
            borderRadius: '1.25rem'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.products.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Product has been deleted successfully.',
                            icon: 'success',
                            confirmButtonColor: '#e11d48'
                        });
                    }
                });
            }
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.products.index'), {
            ...filters,
            search: searchQuery,
            min_price: minPrice,
            max_price: maxPrice
        }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Product Management" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Products</h1>
                        <p className="text-gray-500 font-medium">Manage your product catalog and platform links.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2 text-xl">add_box</span>
                        Add Product
                    </button>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center w-full">
                        <div className="relative flex-1 w-full">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Search by title, keyword, or SKU..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">$</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full pl-7 pr-3 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                    value={minPrice}
                                    onChange={e => setMinPrice(e.target.value)}
                                />
                            </div>
                            <span className="text-gray-300 font-bold">-</span>
                            <div className="relative flex-1 md:w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">$</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full pl-7 pr-3 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all flex items-center justify-center"
                            >
                                <span className="material-icons-outlined text-xl">filter_list</span>
                            </button>
                        </div>
                    </form>
                    <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <select
                            className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs appearance-none uppercase tracking-wider text-gray-700"
                            onChange={e => router.get(route('admin.products.index'), {
                                ...filters,
                                platform: e.target.value,
                                search: searchQuery,
                                min_price: minPrice,
                                max_price: maxPrice
                            }, { preserveState: true })}
                            value={filters.platform || ''}
                        >
                            <option value="">All Platforms</option>
                            <option value="Walmart">Walmart</option>
                            <option value="Amazon">Amazon</option>
                            <option value="eBay">eBay</option>
                            <option value="AliExpress">AliExpress</option>
                            <option value="Other">Other</option>
                        </select>
                        <a
                            href={route('admin.products.export', {
                                ...filters,
                                search: searchQuery,
                                min_price: minPrice,
                                max_price: maxPrice
                            })}
                            className="shrink-0 flex items-center justify-center px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-2xl transition-all uppercase tracking-wider text-xs"
                        >
                            <span className="material-icons-outlined mr-2 text-sm">download</span>
                            Export CSV
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.data.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-16 w-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50 flex-shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <span className="material-icons-outlined text-gray-300">inventory_2</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 line-clamp-1">{product.title}</p>
                                                    <p className="text-xs font-bold text-gray-400 tracking-wider">SKU: {product.sku || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${product.platform === 'Walmart' ? 'bg-orange-50 text-orange-600' :
                                                product.platform === 'Amazon' ? 'bg-amber-50 text-amber-600' :
                                                    product.platform === 'eBay' ? 'bg-blue-50 text-blue-600' :
                                                        product.platform === 'AliExpress' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                {product.platform}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-gray-900 font-mono">${product.price}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className={`font-bold ${product.stock_quantity < 10 ? 'text-rose-500' : 'text-gray-600'}`}>
                                                {product.stock_quantity} <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest ml-1">Units</span>
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${product.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex space-x-2">
                                                <button onClick={() => openModal(product)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                                                    <span className="material-icons-outlined text-sm">edit</span>
                                                </button>
                                                <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                    <span className="material-icons-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center py-4">
                    <div className="flex space-x-1">
                        {products.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => router.visit(link.url)}
                                disabled={!link.url || link.active}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${link.active ? 'bg-gray-900 text-white' :
                                    !link.url ? 'text-gray-300 opacity-50 cursor-not-allowed' :
                                        'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-black tracking-tight">
                                {editingProduct ? 'Update Product' : 'Register New Product'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex flex-col max-h-[85vh]">
                            <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Product Title</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                                value={data.title}
                                                onChange={e => setData('title', e.target.value)}
                                            />
                                            {errors.title && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.title}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Platform</label>
                                                <select
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                                    value={data.platform}
                                                    onChange={e => setData('platform', e.target.value)}
                                                >
                                                    <option value="Walmart">Walmart</option>
                                                    <option value="Amazon">Amazon</option>
                                                    <option value="eBay">eBay</option>
                                                    <option value="AliExpress">AliExpress</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                {errors.platform && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.platform}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Keyword</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                                    value={data.target_keyword}
                                                    onChange={e => setData('target_keyword', e.target.value)}
                                                />
                                                {errors.target_keyword && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.target_keyword}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Product URL</label>
                                            <input
                                                type="url"
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                                value={data.product_url}
                                                onChange={e => setData('product_url', e.target.value)}
                                            />
                                            {errors.product_url && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.product_url}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Product Image</label>
                                            <div className="relative h-48 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-orange-500/50">
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setData('image', e.target.files[0])} />
                                                {data.image ? (
                                                    <img src={URL.createObjectURL(data.image)} className="h-full w-full object-contain" />
                                                ) : editingProduct?.image_url ? (
                                                    <img src={editingProduct.image_url} className="h-full w-full object-contain" />
                                                ) : (
                                                    <div className="text-center">
                                                        <span className="material-icons-outlined text-gray-300 transform scale-150 mb-2">image</span>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Drag or Click to Upload</p>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.image && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.image}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</label>
                                                <select
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                                    value={data.status}
                                                    onChange={e => setData('status', e.target.value)}
                                                >
                                                    <option value="published">Published</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                                {errors.status && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.status}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">SKU</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold font-mono"
                                                    value={data.sku}
                                                    onChange={e => setData('sku', e.target.value)}
                                                />
                                                {errors.sku && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.sku}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Sale Price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number" step="0.01"
                                                className="w-full pl-10 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                                value={data.price}
                                                onChange={e => setData('price', e.target.value)}
                                            />
                                            {errors.price && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.price}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Compare Price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number" step="0.01"
                                                className="w-full pl-10 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-gray-400"
                                                value={data.compare_at_price}
                                                onChange={e => setData('compare_at_price', e.target.value)}
                                            />
                                            {errors.compare_at_price && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.compare_at_price}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Inventory</label>
                                        <input
                                            type="number"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                                            value={data.stock_quantity}
                                            onChange={e => setData('stock_quantity', e.target.value)}
                                        />
                                        {errors.stock_quantity && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.stock_quantity}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Product Description</label>
                                    <textarea
                                        rows="6"
                                        className="w-full px-6 py-5 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-orange-500/20 font-medium"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    ></textarea>
                                    {errors.description && <p className="text-rose-500 text-xs mt-1 pl-1 font-medium">{errors.description}</p>}
                                </div>
                            </div>

                            <div className="p-10 border-t border-gray-50 bg-white shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.05)]">
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-3xl font-black uppercase tracking-widest text-xs transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-[2] py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-orange-100 transition-all disabled:opacity-50"
                                    >
                                        {editingProduct ? 'Save Changes' : 'Publish Product'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
