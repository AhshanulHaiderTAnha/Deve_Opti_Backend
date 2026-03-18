import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FaqIndex({ faqs }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        question: '',
        answer: '',
        status: 'published',
        position: 0,
    });

    const openCreateModal = () => {
        setEditData(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (faq) => {
        setEditData(faq);
        setData({
            question: faq.question,
            answer: faq.answer,
            status: faq.status,
            position: faq.position,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editData) {
            put(route('admin.faqs.update', editData.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.faqs.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const deleteFaq = (id) => {
        if (confirm('Delete this FAQ?')) {
            router.delete(route('admin.faqs.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="FAQs" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">FAQ Management</h1>
                        <p className="text-gray-500 font-medium">Manage frequently asked questions for your users.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Create FAQ
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                    {faqs.data.map((faq) => (
                        <div key={faq.id} className="p-8 group hover:bg-gray-50/50 transition-all flex justify-between items-start gap-6">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center space-x-3">
                                    <span className="h-6 w-6 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-[10px] font-black">
                                        {faq.position}
                                    </span>
                                    <h3 className="font-black text-gray-900 leading-tight">{faq.question}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${faq.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                        }`}>
                                        {faq.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed pl-9">
                                    {faq.answer}
                                </p>
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(faq)} className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm">
                                    <span className="material-icons-outlined text-sm">edit</span>
                                </button>
                                <button onClick={() => deleteFaq(faq.id)} className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
                                    <span className="material-icons-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
                        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {editData ? 'Edit FAQ' : 'Create New FAQ'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Question</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                    placeholder="Enter question"
                                    value={data.question}
                                    onChange={e => setData('question', e.target.value)}
                                />
                                {errors.question && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.question}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="published">Published</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Order Position</label>
                                    <input
                                        type="number"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                        value={data.position}
                                        onChange={e => setData('position', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Answer</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm h-32 resize-none"
                                    placeholder="Provide a clear answer..."
                                    value={data.answer}
                                    onChange={e => setData('answer', e.target.value)}
                                ></textarea>
                                {errors.answer && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.answer}</p>}
                            </div>

                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-gray-200"
                                >
                                    {editData ? 'Update FAQ' : 'Create FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
