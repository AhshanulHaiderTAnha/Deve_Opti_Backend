import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function UserTaskDetails({ assignment, nextProduct, orderHistory }) {
    const skipOrder = () => {
        Swal.fire({
            title: 'Skip current order?',
            text: `This will mark the order for "${nextProduct.title}" as done with $0.00 commission.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, skip it'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.user-tasks.skip-order', assignment.id), {}, {
                    onSuccess: () => Swal.fire('Skipped!', 'Order marked as done with zero commission.', 'success')
                });
            }
        });
    };

    const deleteAssignment = () => {
        Swal.fire({
            title: 'Cancel Assignment?',
            text: "This removes the task from the user. Their completed progress within this task will be lost.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.user-tasks.destroy', assignment.id), {
                    onSuccess: () => router.visit(route('admin.user-tasks.index'))
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Task Details - ${assignment.user.name}`} />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={route('admin.user-tasks.index')} 
                            className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all hover:shadow-md"
                        >
                            <span className="material-icons-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Assignment Details</h1>
                            <p className="text-gray-500 font-medium">Tracking progress for {assignment.user.name}.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {assignment.status === 'in_progress' && assignment.completed_orders < (assignment.order_task?.required_orders || 0) && (
                            <>
                                <button
                                    onClick={skipOrder}
                                    className="px-6 py-3 bg-amber-50 text-amber-600 border border-amber-100/50 hover:bg-amber-100 rounded-2xl font-bold flex items-center transition-all"
                                >
                                    <span className="material-icons-outlined mr-2">skip_next</span>
                                    Skip Current Order
                                </button>
                                <button
                                    onClick={deleteAssignment}
                                    className="px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100/50 hover:bg-rose-100 rounded-2xl font-bold flex items-center transition-all"
                                >
                                    <span className="material-icons-outlined mr-2">delete_forever</span>
                                    Cancel Task
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Summary & Current Product */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Progress Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <span className="material-icons-outlined text-9xl">trending_up</span>
                            </div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                                <div className="space-y-6 flex-1">
                                    <div>
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Task Batch</h3>
                                        <div className="text-xl font-black text-gray-900 italic tracking-tight">{assignment.order_task.title}</div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Progress</span>
                                            <span className="text-lg font-black text-orange-600 italic">
                                                {assignment.completed_orders} / {assignment.order_task.required_orders}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-50 p-1">
                                            <div 
                                                className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full shadow-inner transition-all duration-1000 ease-out"
                                                style={{ width: `${(assignment.completed_orders / assignment.order_task.required_orders) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end items-end space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-8">
                                    <div className="text-right">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Earned</h3>
                                        <div className="text-3xl font-black text-green-600 tracking-tighter italic">
                                            ${parseFloat(assignment.total_earned_commission).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        assignment.status === 'completed' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                        {assignment.status.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Queue / Next Product */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center">
                                    <span className="material-icons-outlined mr-3 text-orange-500">shopping_bag</span>
                                    Current Queue Item
                                </h3>
                                {assignment.status === 'in_progress' && (
                                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-100">Pending Order</span>
                                )}
                            </div>

                            {assignment.status === 'in_progress' && nextProduct ? (
                                <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <div className="h-40 w-40 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {nextProduct.image_path ? (
                                            <img src={`/storage/${nextProduct.image_path}`} alt={nextProduct.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-icons-outlined text-4xl text-gray-200">image</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 tracking-tight leading-tight mb-1">{nextProduct.title}</h4>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{nextProduct.platform || 'General Platform'}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product Price</span>
                                                <span className="text-lg font-black text-gray-900">${parseFloat(nextProduct.price).toFixed(2)}</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. Commission</span>
                                                <span className="text-lg font-black text-indigo-600">Calculated on Proc.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
                                    <span className="material-icons-outlined text-4xl text-gray-200 mb-2">task_alt</span>
                                    <p className="text-gray-500 font-bold text-sm">Task fully completed. No pending orders.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: User Info & Order History */}
                    <div className="space-y-8">
                        {/* User Profile Info */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">User Information</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                                    {assignment.user.name[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-bold text-gray-900 truncate">{assignment.user.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{assignment.user.email}</div>
                                </div>
                            </div>
                            <Link 
                                href={route('admin.users.show', assignment.user.id)}
                                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-black uppercase tracking-widest text-[9px] flex justify-center items-center transition-all border border-gray-100"
                            >
                                <span className="material-icons-outlined text-sm mr-2">person</span>
                                View Full Profile
                            </Link>
                        </div>

                        {/* Order History List */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col h-[600px]">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 shrink-0">Order History</h3>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {orderHistory.length > 0 ? orderHistory.map((order, idx) => (
                                    <div key={order.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all group">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="text-[10px] font-black text-gray-300">#{(orderHistory.length - idx).toString().padStart(2, '0')}</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                                order.status === 'skipped' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="font-bold text-gray-900 text-xs truncate mb-1" title={order.product?.title}>
                                            {order.product?.title || 'Unknown Product'}
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100/50 mt-2">
                                            <div className="text-[9px] font-black text-gray-400">${parseFloat(order.order_price).toFixed(2)}</div>
                                            <div className="text-[10px] font-black text-emerald-600">+${parseFloat(order.commission_amount).toFixed(2)}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                                        <span className="material-icons-outlined text-4xl mb-2">history</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">No history yet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}} />
        </AdminLayout>
    );
}
