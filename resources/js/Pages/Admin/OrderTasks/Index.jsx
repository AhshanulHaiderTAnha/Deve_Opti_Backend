import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

/**
 * Per-product commission state shape:
 * productOverrides = {
 *   [productId]: {
 *     type: ''|'percent'|'flat',   // '' = inherit task default
 *     percent: '',                  // used when type = 'percent'
 *     flat: '',                     // used when type = 'flat'
 *   }
 * }
 */

export default function OrderTaskIndex({ tasks, commissionTiers, products, filters = {} }) {
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [editingTask, setEditingTask]       = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Price filter state
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');

    // Per-product overrides
    const [productOverrides, setProductOverrides] = useState({});

    const dropdownRef = useRef(null);

    const { data, setData, processing, errors, reset, clearErrors } = useForm({
        title:                     '',
        commission_type:           'tier',
        commission_tier_id:        '',
        manual_commission_percent: '',
        required_orders:           25,
        status:                    'active',
        product_ids:               [],
    });

    // Close dropdown on outside click
    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isDropdownOpen]);

    const openModal = (task = null) => {
        setPriceMin('');
        setPriceMax('');

        if (task) {
            setEditingTask(task);
            const overrides = {};
            task.products.forEach(p => {
                const pivotType = p.pivot?.custom_commission_type ?? '';
                overrides[p.id] = {
                    type:    pivotType,
                    percent: pivotType === 'percent' ? String(p.pivot.custom_commission_percent ?? '') : '',
                    flat:    pivotType === 'flat'    ? String(p.pivot.custom_commission_flat    ?? '') : '',
                };
            });
            setProductOverrides(overrides);
            setData({
                title:                     task.title,
                commission_type:           task.commission_type,
                commission_tier_id:        task.commission_tier_id || '',
                manual_commission_percent: task.manual_commission_percent || '',
                required_orders:           task.required_orders,
                status:                    task.status,
                product_ids:               task.products.map(p => p.id),
            });
        } else {
            setEditingTask(null);
            setProductOverrides({});
            reset();
        }
        clearErrors();
        setIsDropdownOpen(false);
        setIsModalOpen(true);
    };

    const handleProductToggle = (productId, checked) => {
        if (checked) {
            setData('product_ids', [...data.product_ids, productId]);
            setProductOverrides(prev => ({
                ...prev,
                [productId]: { type: '', percent: '', flat: '' }
            }));
        } else {
            setData('product_ids', data.product_ids.filter(id => id !== productId));
            setProductOverrides(prev => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
        }
    };

    const setOverrideType = (productId, type) => {
        setProductOverrides(prev => ({
            ...prev,
            [productId]: { ...prev[productId], type }
        }));
    };

    const setOverrideValue = (productId, field, value) => {
        setProductOverrides(prev => ({
            ...prev,
            [productId]: { ...prev[productId], [field]: value }
        }));
    };

    const removeProduct = (e, productId) => {
        e.stopPropagation();
        handleProductToggle(productId, false);
    };

    // Build payload for submission
    const buildPayload = () => {
        const product_commissions      = {};
        const product_commission_types = {};
        const product_flat_commissions = {};

        Object.entries(productOverrides).forEach(([pid, ov]) => {
            if (ov.type === 'percent') {
                product_commission_types[pid] = 'percent';
                product_commissions[pid]      = ov.percent;
            } else if (ov.type === 'flat') {
                product_commission_types[pid]  = 'flat';
                product_flat_commissions[pid]  = ov.flat;
            }
            // type '' → no keys or null → backend treats as inherit default
        });

        return {
            ...data,
            product_commissions,
            product_commission_types,
            product_flat_commissions,
        };
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = buildPayload();

        if (editingTask) {
            router.post(route('admin.order-tasks.update', editingTask.id), {
                _method: 'PATCH',
                ...payload,
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    Swal.fire('Updated!', 'Task template has been updated.', 'success');
                }
            });
        } else {
            router.post(route('admin.order-tasks.store'), payload, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    setProductOverrides({});
                    Swal.fire('Created!', 'New task template created.', 'success');
                }
            });
        }
    };

    const deleteTask = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.order-tasks.destroy', id), {
                    onSuccess: () => Swal.fire('Deleted!', 'Task removed.', 'success')
                });
            }
        });
    };

    // Price-filtered products for the dropdown
    const filteredProducts = products.filter(p => {
        const price = parseFloat(p.price);
        if (priceMin !== '' && price < parseFloat(priceMin)) return false;
        if (priceMax !== '' && price > parseFloat(priceMax)) return false;
        return true;
    });

    /** Renders the commission badge on a product in the card list */
    const CommissionBadge = ({ pivot }) => {
        if (!pivot?.custom_commission_type) return null;
        if (pivot.custom_commission_type === 'flat') {
            return (
                <span className="bg-blue-100 text-blue-800 px-1.5 rounded text-[9px] font-black ml-1">
                    ${parseFloat(pivot.custom_commission_flat).toFixed(2)} flat
                </span>
            );
        }
        return (
            <span className="bg-orange-200 text-orange-800 px-1.5 rounded text-[9px] font-black ml-1">
                {pivot.custom_commission_percent}%
            </span>
        );
    };

    /** Inline per-product override control (type toggle + value input) */
    const ProductOverrideInput = ({ productId, stopClick = false }) => {
        const ov = productOverrides[productId] || { type: '', percent: '', flat: '' };

        const wrapClick = (fn) => stopClick ? (e) => { e.stopPropagation(); fn(e); } : fn;

        return (
            <div
                className="flex items-center gap-1 flex-shrink-0"
                onClick={stopClick ? (e) => e.stopPropagation() : undefined}
            >
                {/* Type toggle: default / % / $ */}
                <div className="flex rounded-md overflow-hidden border border-gray-200 text-[10px] font-black">
                    <button
                        type="button"
                        title="Inherit task default commission"
                        onClick={wrapClick(() => setOverrideType(productId, ''))}
                        className={`px-1.5 py-1 transition-colors ${
                            ov.type === '' ? 'bg-gray-700 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                        DEF
                    </button>
                    <button
                        type="button"
                        title="Custom percentage commission"
                        onClick={wrapClick(() => setOverrideType(productId, 'percent'))}
                        className={`px-1.5 py-1 transition-colors border-l border-gray-200 ${
                            ov.type === 'percent' ? 'bg-orange-500 text-white' : 'bg-white text-gray-400 hover:bg-orange-50'
                        }`}
                    >
                        %
                    </button>
                    <button
                        type="button"
                        title="Custom flat dollar commission"
                        onClick={wrapClick(() => setOverrideType(productId, 'flat'))}
                        className={`px-1.5 py-1 transition-colors border-l border-gray-200 ${
                            ov.type === 'flat' ? 'bg-blue-500 text-white' : 'bg-white text-gray-400 hover:bg-blue-50'
                        }`}
                    >
                        $
                    </button>
                </div>

                {/* Value input — shown only when type is set */}
                {ov.type === 'percent' && (
                    <div className="flex items-center gap-0.5 bg-orange-50 border border-orange-300 rounded-md px-1.5 py-1">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-10 text-xs font-bold text-center border-none outline-none bg-transparent text-orange-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            value={ov.percent}
                            onChange={e => setOverrideValue(productId, 'percent', e.target.value)}
                        />
                        <span className="text-orange-500 text-[10px] font-black">%</span>
                    </div>
                )}

                {ov.type === 'flat' && (
                    <div className="flex items-center gap-0.5 bg-blue-50 border border-blue-300 rounded-md px-1.5 py-1">
                        <span className="text-blue-500 text-[10px] font-black">$</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-12 text-xs font-bold text-center border-none outline-none bg-transparent text-blue-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0.00"
                            value={ov.flat}
                            onChange={e => setOverrideValue(productId, 'flat', e.target.value)}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Order Tasks Templates" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Task Templates</h1>
                        <p className="text-gray-500 font-medium text-sm text-neutral-400">
                            Manage batches of product orders that users can grab and process.
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Create Task Template
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full xl:max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                            defaultValue={filters?.search || ''}
                            onKeyUp={e => e.key === 'Enter' && router.get(route('admin.order-tasks.index'), { ...filters, search: e.target.value }, { preserveState: true })}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                        <select
                            className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-xs uppercase tracking-wider text-gray-700 appearance-none min-w-[120px]"
                            defaultValue={filters?.status || ''}
                            onChange={e => router.get(route('admin.order-tasks.index'), { ...filters, status: e.target.value }, { preserveState: true })}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <a
                            href={route('admin.order-tasks.index', { ...filters, export: 1 })}
                            className="shrink-0 flex items-center justify-center px-6 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                        >
                            <span className="material-icons-outlined mr-2 text-sm">download</span>
                            CSV
                        </a>
                    </div>
                </div>

                {/* Task Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                                    <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {task.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex space-x-1">
                                    <button onClick={() => openModal(task)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <span className="material-icons-outlined text-[20px]">edit</span>
                                    </button>
                                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                        <span className="material-icons-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 flex-1">
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Commission Type:</span>
                                    <span className="font-bold text-gray-900 uppercase tracking-wider">{task.commission_type}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Rate/Tier:</span>
                                    <span className="font-black text-orange-500 bg-orange-50 px-2 py-1 rounded">
                                        {task.commission_type === 'tier' ? task.tier?.name : `${task.manual_commission_percent}% (Manual)`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Required Orders:</span>
                                    <span className="font-bold text-blue-600">{task.required_orders} items</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                        Product Pool ({task.products.length})
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {task.products.slice(0, 5).map(p => (
                                            <span key={p.id} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-medium truncate max-w-[150px] flex items-center gap-1">
                                                {p.title}
                                                <CommissionBadge pivot={p.pivot} />
                                            </span>
                                        ))}
                                        {task.products.length > 5 && (
                                            <span className="bg-gray-100 text-gray-400 px-2 py-1 rounded-md text-[10px] font-bold">
                                                +{task.products.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {tasks.length === 0 && (
                        <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 border-dashed">
                            <span className="material-icons-outlined text-4xl text-gray-300 mb-3 block">inventory_2</span>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks templates created</h3>
                            <p className="text-gray-500 text-sm">Create a task template to group products for user order assignments.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ===================== MODAL ===================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>

                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[2rem] flex-shrink-0">
                            <h2 className="font-black text-gray-900 tracking-tight text-lg">
                                {editingTask ? 'Edit Task Template' : 'Create Task Template'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 space-y-5 overflow-y-auto flex-1">

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Task Title Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. VIP Shopper Pool A"
                                />
                                {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title}</p>}
                            </div>

                            {/* Commission Type + Required Orders */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commission Type</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                        value={data.commission_type}
                                        onChange={e => setData('commission_type', e.target.value)}
                                    >
                                        <option value="tier">Commission Tier (Plan based)</option>
                                        <option value="manual">Manual Fixed %</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required Orders</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                        value={data.required_orders}
                                        onChange={e => setData('required_orders', e.target.value)}
                                        min="1"
                                    />
                                    {errors.required_orders && <p className="text-red-500 text-xs font-bold">{errors.required_orders}</p>}
                                </div>
                            </div>

                            {/* Tier / Manual Commission */}
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                {data.commission_type === 'tier' ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Commission Tier</label>
                                        <select
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                            value={data.commission_tier_id}
                                            onChange={e => setData('commission_tier_id', e.target.value)}
                                        >
                                            <option value="">-- Select a Tier --</option>
                                            {commissionTiers.map(tier => (
                                                <option key={tier.id} value={tier.id}>
                                                    {tier.name} ({parseFloat(tier.commission_rate)}%)
                                                </option>
                                            ))}
                                        </select>
                                        {errors.commission_tier_id && <p className="text-red-500 text-xs font-bold">{errors.commission_tier_id}</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manual Commission Percent (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                            value={data.manual_commission_percent}
                                            onChange={e => setData('manual_commission_percent', e.target.value)}
                                            placeholder="e.g. 5.5"
                                        />
                                        {errors.manual_commission_percent && <p className="text-red-500 text-xs font-bold">{errors.manual_commission_percent}</p>}
                                    </div>
                                )}
                            </div>

                            {/* ── Product Selector ── */}
                            <div className="space-y-2" ref={dropdownRef}>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                                    <span>Select Products for this Task Pool</span>
                                    <span className="text-blue-500 font-black">{data.product_ids.length} selected</span>
                                </label>

                                {/* Selected product tags with inline commission override control */}
                                {data.product_ids.length > 0 && (
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                                        {data.product_ids.map(id => {
                                            const p = products.find(prod => prod.id === id);
                                            return p ? (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-wrap"
                                                >
                                                    {/* Product name + price */}
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm font-bold text-gray-800 block truncate">{p.title}</span>
                                                        <span className="text-xs text-gray-400 font-medium">${p.price} · {p.platform}</span>
                                                    </div>

                                                    {/* Commission override control */}
                                                    <ProductOverrideInput productId={id} stopClick={false} />

                                                    {/* Remove button */}
                                                    <button
                                                        type="button"
                                                        onClick={e => removeProduct(e, id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                                                    >
                                                        <span className="material-icons-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                )}

                                {/* Trigger button */}
                                <button
                                    type="button"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:border-orange-300 transition-all flex items-center gap-2"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className="material-icons-outlined text-gray-400 text-base">add_circle_outline</span>
                                    {isDropdownOpen ? 'Close product picker' : 'Browse & add products'}
                                </button>

                                {/* Dropdown */}
                                {isDropdownOpen && (
                                    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

                                        {/* Price Filter Bar */}
                                        <div className="p-3 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-2">
                                            <span className="material-icons-outlined text-gray-400 text-base">filter_list</span>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price:</span>
                                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                                                <span className="text-gray-400 text-xs">Min $</span>
                                                <input
                                                    type="number"
                                                    className="w-14 text-xs font-bold border-none outline-none bg-transparent text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="0"
                                                    value={priceMin}
                                                    onChange={e => setPriceMin(e.target.value)}
                                                />
                                            </div>
                                            <span className="text-gray-400 text-xs">—</span>
                                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                                                <span className="text-gray-400 text-xs">Max $</span>
                                                <input
                                                    type="number"
                                                    className="w-14 text-xs font-bold border-none outline-none bg-transparent text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="∞"
                                                    value={priceMax}
                                                    onChange={e => setPriceMax(e.target.value)}
                                                />
                                            </div>
                                            {(priceMin || priceMax) && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setPriceMin(''); setPriceMax(''); }}
                                                    className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5"
                                                >
                                                    <span className="material-icons-outlined text-[13px]">close</span>
                                                    Clear
                                                </button>
                                            )}
                                            <span className="ml-auto text-[10px] text-gray-400 font-bold">
                                                {filteredProducts.length}/{products.length}
                                            </span>
                                        </div>

                                        {/* Product List */}
                                        <div className="max-h-56 overflow-y-auto p-2 space-y-1">
                                            {filteredProducts.map(product => {
                                                const isSelected = data.product_ids.includes(product.id);
                                                return (
                                                    <div
                                                        key={product.id}
                                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border gap-3 ${
                                                            isSelected
                                                                ? 'bg-orange-50 border-orange-200'
                                                                : 'bg-transparent border-transparent hover:bg-gray-50'
                                                        }`}
                                                        onClick={() => handleProductToggle(product.id, !isSelected)}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 transition-all cursor-pointer"
                                                                checked={isSelected}
                                                                onChange={e => handleProductToggle(product.id, e.target.checked)}
                                                            />
                                                        </div>

                                                        {/* Product info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-bold truncate ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>
                                                                {product.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 flex items-center mt-0.5 gap-2">
                                                                <span className="font-black text-gray-900">${product.price}</span>
                                                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold uppercase tracking-wider">{product.platform}</span>
                                                            </p>
                                                        </div>

                                                        {/* Inline override control (only when selected) */}
                                                        {isSelected && (
                                                            <div onClick={e => e.stopPropagation()}>
                                                                <ProductOverrideInput productId={product.id} stopClick={true} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {filteredProducts.length === 0 && (
                                                <div className="p-6 text-center text-sm text-gray-400">
                                                    <span className="material-icons-outlined block text-2xl mb-1 text-gray-300">search_off</span>
                                                    No products match this price range.
                                                </div>
                                            )}
                                        </div>

                                        {/* Dropdown Footer */}
                                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <span className="bg-gray-700 text-white px-1 rounded font-black">DEF</span> = task default
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="bg-orange-500 text-white px-1 rounded font-black">%</span> = custom percent
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="bg-blue-500 text-white px-1 rounded font-black">$</span> = flat amount
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="px-4 py-2 bg-gray-900 text-white text-xs font-black rounded-lg hover:bg-black transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-icons-outlined text-[14px]">check</span>
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {errors.product_ids && <p className="text-red-500 text-xs font-bold">{errors.product_ids}</p>}

                                {/* Legend / hint */}
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-[11px] text-gray-500 font-medium space-y-1">
                                    <p>💡 <span className="font-black text-gray-700">DEF</span> — product uses the task-level commission (tier or manual %)</p>
                                    <p>💡 <span className="font-black text-orange-500">%</span> — custom percentage override for this specific product</p>
                                    <p>💡 <span className="font-black text-blue-600">$</span> — flat dollar amount earned regardless of product price</p>
                                </div>
                            </div>

                            {/* Status toggle */}
                            <div className="space-y-2 pt-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300"
                                        checked={data.status === 'active'}
                                        onChange={e => setData('status', e.target.checked ? 'active' : 'inactive')}
                                    />
                                    <span className="text-sm font-bold text-gray-700">Task Template is Active</span>
                                </label>
                            </div>
                        </div>

                        {/* Fixed Footer — Save always visible */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem] flex-shrink-0">
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing
                                    ? <><span className="material-icons-outlined animate-spin text-sm">sync</span> Saving...</>
                                    : <><span className="material-icons-outlined text-sm">save</span> {editingTask ? 'Save Changes' : 'Create Task'}</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
