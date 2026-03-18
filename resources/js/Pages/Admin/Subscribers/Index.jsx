import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function SubscriberIndex({ subscribers }) {
    const deleteSubscriber = (id) => {
        if (confirm('Permanently remove this subscriber?')) {
            router.delete(route('admin.subscribers.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Newsletter Subscribers" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Newsletter Audience</h1>
                        <p className="text-gray-500 font-medium">Manage your "Stay in the loop" subscription list.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-left">
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subscriber Email</th>
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined Date</th>
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {subscribers.data.length > 0 ? subscribers.data.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-black text-xs">
                                                {sub.email[0].toUpperCase()}
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">{sub.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="text-xs font-bold text-gray-400">
                                            {new Date(sub.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button
                                            onClick={() => deleteSubscriber(sub.id)}
                                            className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                        >
                                            <span className="material-icons-outlined text-sm">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <span className="material-icons-outlined text-4xl text-gray-200">contact_mail</span>
                                            <p className="text-gray-400 font-bold text-sm tracking-tight uppercase">No subscribers found yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {subscribers.links.length > 3 && (
                    <div className="flex justify-center py-4">
                        <div className="flex space-x-1">
                            {subscribers.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.visit(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${link.active ? 'bg-gray-900 text-white' :
                                            !link.url ? 'text-gray-300 opacity-50 cursor-not-allowed' :
                                                'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 shadow-sm border border-transparent'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
