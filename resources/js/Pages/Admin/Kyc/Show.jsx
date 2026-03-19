import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function KycShow({ kyc: kycWrap }) {
    const kyc = kycWrap.data;
    const [isRejecting, setIsRejecting] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
    });

    const approve = () => {
        Swal.fire({
            title: 'Approve KYC?',
            text: "Are you sure you want to approve this verification request?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Approve',
            background: '#ffffff',
            borderRadius: '1.25rem'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('admin.kyc.approve', kyc.id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Approved!',
                            text: 'KYC submission has been approved successfully.',
                            icon: 'success',
                            confirmButtonColor: '#059669'
                        });
                    }
                });
            }
        });
    };

    const reject = (e) => {
        e.preventDefault();
        post(route('admin.kyc.reject', kyc.id), {
            onSuccess: () => {
                setIsRejecting(false);
                reset();
                Swal.fire({
                    title: 'Rejected!',
                    text: 'KYC submission has been rejected.',
                    icon: 'success',
                    confirmButtonColor: '#e11d48'
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`KYC Review - ${kyc.user?.name}`} />

            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('admin.kyc.index')} className="p-2 hover:bg-orange-50 rounded-xl text-orange-500 transition-colors">
                            <span className="material-icons-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Review KYC Submission</h1>
                            <p className="text-gray-500">Verification request for {kyc.user?.name}</p>
                        </div>
                    </div>

                    {kyc.status === 'pending' && (
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsRejecting(true)}
                                className="px-4 py-2 text-sm font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                                Reject
                            </button>
                            <button
                                onClick={approve}
                                disabled={processing}
                                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
                            >
                                Approve KYC
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Info & Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">Personal Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Full Name</p>
                                    <p className="text-gray-900 font-medium">{kyc.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Date of Birth</p>
                                    <p className="text-gray-900 font-medium">{kyc.date_of_birth}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Country</p>
                                    <p className="text-gray-900 font-medium">{kyc.country}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">ID Type / Number</p>
                                    <p className="text-gray-900 font-medium">{kyc.id_type_label} - <span className="text-gray-500">{kyc.id_number}</span></p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Address</p>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{kyc.address}</p>
                                </div>
                            </div>
                        </section>

                        {kyc.status === 'rejected' && (
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                                <p className="text-xs text-rose-400 uppercase font-bold mb-1">Rejection Reason</p>
                                <p className="text-rose-700 text-sm">{kyc.rejection_reason}</p>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">Identity Documents</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-700 flex items-center">
                                        <span className="material-icons-outlined text-gray-400 text-lg mr-1.5">assignment_ind</span>
                                        ID Document
                                    </p>
                                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative group">
                                        <img src={kyc.id_document_url} alt="ID Doc" className="object-contain h-full w-full" />
                                        <a href={kyc.id_document_url} target="_blank" className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                            <span className="bg-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg">Open Original</span>
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-700 flex items-center">
                                        <span className="material-icons-outlined text-gray-400 text-lg mr-1.5">photo_camera</span>
                                        Selfie Photo
                                    </p>
                                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative group">
                                        <img src={kyc.selfie_url} alt="Selfie" className="object-contain h-full w-full" />
                                        <a href={kyc.selfie_url} target="_blank" className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                            <span className="bg-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg">Open Original</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Reject Modal Placeholder */}
                {isRejecting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Reject KYC Submission</h3>
                                <p className="text-gray-500 text-sm mt-1">Please provide a reason why this verification was rejected. The user will see this message.</p>
                            </div>
                            
                            <form onSubmit={reject} className="space-y-4">
                                <textarea
                                    className="w-full border-gray-200 rounded-xl bg-gray-50 p-4 text-sm focus:ring-rose-500 focus:border-rose-500"
                                    rows="4"
                                    placeholder="e.g. Identity document is blurry, or data doesn't match..."
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    required
                                ></textarea>
                                {errors.reason && <p className="text-red-500 text-xs">{errors.reason}</p>}
                                
                                <div className="flex space-x-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsRejecting(false)}
                                        className="flex-1 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-200 transition-all"
                                    >
                                        {processing ? 'Processing...' : 'Reject KYC'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
