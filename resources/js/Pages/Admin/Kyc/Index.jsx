import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function KycIndex({ submissions, filters }) {
    return (
        <AdminLayout>
            <Head title="KYC Review" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">KYC Verification Queue</h1>
                    <p className="text-gray-500">Review and manage user identity verification requests.</p>
                </div>

                {/* Submissions Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">User</th>
                                <th className="px-6 py-3 font-semibold">ID Type</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Submitted At</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.data.map((kyc) => (
                                <tr key={kyc.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{kyc.user?.name}</span>
                                            <span className="text-xs text-gray-500">{kyc.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700">{kyc.id_type_label}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            kyc.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            kyc.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                            {kyc.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(kyc.submitted_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={route('admin.kyc.show', kyc.id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="material-icons-outlined text-lg mr-1.5">visibility</span>
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {submissions.data.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No KYC submissions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
