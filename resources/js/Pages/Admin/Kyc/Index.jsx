import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

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
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {kyc.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Approve KYC?',
                                                            text: `Are you sure you want to approve verification for ${kyc.user?.name}?`,
                                                            icon: 'question',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#059669',
                                                            cancelButtonColor: '#94a3b8',
                                                            confirmButtonText: 'Yes, Approve'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                router.post(route('admin.kyc.approve', kyc.id), {}, {
                                                                    onSuccess: () => {
                                                                        Swal.fire('Approved!', 'KYC has been approved.', 'success');
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }}
                                                    className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors"
                                                    title="Approve"
                                                >
                                                    <span className="material-icons-outlined text-sm">done</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Reject KYC',
                                                            text: 'Please provide a reason for rejection:',
                                                            input: 'text',
                                                            inputAttributes: {
                                                                autocapitalize: 'off',
                                                                required: 'true'
                                                            },
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#e11d48',
                                                            confirmButtonText: 'Reject',
                                                            showLoaderOnConfirm: true,
                                                            preConfirm: (reason) => {
                                                                if (!reason) {
                                                                    Swal.showValidationMessage('Rejection reason is required');
                                                                }
                                                                return reason;
                                                            }
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                router.post(route('admin.kyc.reject', kyc.id), { reason: result.value }, {
                                                                    onSuccess: () => {
                                                                        Swal.fire('Rejected!', 'KYC has been rejected.', 'success');
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }}
                                                    className="inline-flex items-center px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors"
                                                    title="Reject"
                                                >
                                                    <span className="material-icons-outlined text-sm">close</span>
                                                </button>
                                            </>
                                        )}
                                        <Link
                                            href={route('admin.kyc.show', kyc.id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-orange-200 text-sm font-semibold rounded-lg text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
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
