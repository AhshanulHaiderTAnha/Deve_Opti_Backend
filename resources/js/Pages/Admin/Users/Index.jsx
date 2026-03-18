import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UserIndex({ users, filters }) {
    return (
        <AdminLayout>
            <Head title="Users List" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                        <p className="text-gray-500">Manage all registered users and their account statuses.</p>
                    </div>
                </div>

                {/* Filters (Simplified for now) */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center space-x-4">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <span className="material-icons-outlined text-xl">search</span>
                        </span>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Search by name or email..."
                            defaultValue={filters.search}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">User Details</th>
                                <th className="px-6 py-3 font-semibold">KYC Status</th>
                                <th className="px-6 py-3 font-semibold">Account Status</th>
                                <th className="px-6 py-3 font-semibold">Joined</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200 mr-3">
                                                {user.name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{user.name}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            user.kyc_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            user.kyc_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            user.kyc_status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                            'bg-gray-50 text-gray-500 border-gray-100'
                                        }`}>
                                            {(user.kyc_status || 'NOT SUBMITTED').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <span className={`h-2 w-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="text-sm text-gray-700 capitalize">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button title="Edit User" className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                                            <span className="material-icons-outlined text-lg">edit</span>
                                        </button>
                                        <button title="View Details" className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                            <span className="material-icons-outlined text-lg">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Simple Pagination Placeholder */}
                <div className="flex items-center justify-between text-sm text-gray-500 px-2">
                    <p>Showing {users.data.length} users</p>
                    <div className="flex space-x-2">
                        {/* Pagination links would go here */}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
