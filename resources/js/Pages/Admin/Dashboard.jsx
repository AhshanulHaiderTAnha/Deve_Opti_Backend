import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function Dashboard({ stats, recentActivity, recentDeposits, recentWithdrawals, recentPendingTasks, recentCompletedTasks }) {
    const [isOptimizing, setIsOptimizing] = React.useState(false);

    const statCards = [
        { label: 'Total Users', value: stats.total_users, icon: 'people', color: 'bg-orange-500' },
        { label: 'Total Sellers', value: stats.total_sellers, icon: 'storefront', color: 'bg-purple-500' },
        { label: 'Total Products', value: stats.total_products, icon: 'inventory_2', color: 'bg-blue-500' },
        { label: 'Support Tickets', value: stats.total_support_tickets, icon: 'history', color: 'bg-gray-700' },
        { label: 'Pending Tickets', value: stats.pending_support_tickets, icon: 'confirmation_number', color: 'bg-rose-500' },
        { label: 'Pending KYC', value: stats.pending_kyc, icon: 'hourglass_empty', color: 'bg-amber-500' },
        { label: 'Total Deposits', value: '$' + (parseFloat(stats.total_deposits) || 0).toFixed(2), icon: 'file_download', color: 'bg-teal-500' },
        { label: 'Total Withdrawals', value: '$' + (parseFloat(stats.total_withdrawals) || 0).toFixed(2), icon: 'file_upload', color: 'bg-indigo-500' },
        { label: 'Pending Deposits', value: stats.pending_deposits_count, icon: 'pending_actions', color: 'bg-amber-400' },
        { label: 'Pending Withdrawals', value: stats.pending_withdrawals_count, icon: 'hourglass_top', color: 'bg-red-400' },
        { label: 'This Month Deposits', value: '$' + (parseFloat(stats.this_month_deposits) || 0).toFixed(2), icon: 'trending_up', color: 'bg-emerald-400' },
        { label: 'This Month Withdrawals', value: '$' + (parseFloat(stats.this_month_withdrawals) || 0).toFixed(2), icon: 'trending_down', color: 'bg-rose-400' },
    ];

    const taskStats = [
        { label: 'Today Paid Commissions', value: '$' + (parseFloat(stats.today_commission) || 0).toFixed(2), icon: 'payments', color: 'bg-emerald-500' },
        { label: 'Total Running Tasks', value: stats.running_tasks, icon: 'directions_run', color: 'bg-blue-500' },
        { label: 'Total Completed Tasks', value: stats.completed_tasks, icon: 'task_alt', color: 'bg-indigo-500' },
        { label: 'Today Running', value: stats.today_running_tasks, icon: 'today', color: 'bg-sky-400' },
        { label: 'Today Completed', value: stats.today_completed_tasks, icon: 'event_available', color: 'bg-violet-400' },
        { label: 'Weekly Running', value: stats.weekly_running_tasks, icon: 'date_range', color: 'bg-sky-500' },
        { label: 'Weekly Completed', value: stats.weekly_completed_tasks, icon: 'event_note', color: 'bg-violet-500' },
        { label: 'Monthly Running', value: stats.monthly_running_tasks, icon: 'calendar_month', color: 'bg-sky-600' },
        { label: 'Monthly Completed', value: stats.monthly_completed_tasks, icon: 'fact_check', color: 'bg-violet-600' },
    ];

    const handleClearCache = () => {
        Swal.fire({
            title: 'Clear System Cache?',
            text: "This will clear all application, view, and route caches. Temporary performance drop might occur during rebuild.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, optimize system!',
            customClass: {
                popup: 'rounded-[1.5rem]',
                confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3',
                cancelButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setIsOptimizing(true);
                router.post(route('admin.dashboard.clear-cache'), {}, {
                    onFinish: () => setIsOptimizing(false),
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Optimized!',
                            text: 'System cache has been cleared successfully.',
                            icon: 'success',
                            confirmButtonColor: '#10b981',
                            customClass: {
                                popup: 'rounded-[1.5rem]',
                                confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3'
                            }
                        });
                    }
                });
            }
        });
    };

    const RecentTable = ({ title, data, type, viewAllHref }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <a href={viewAllHref} className="text-blue-600 font-medium text-sm hover:underline">View All</a>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider">
                            <th className="px-6 py-3 font-semibold">User</th>
                            <th className="px-6 py-3 font-semibold text-right">Details</th>
                            <th className="px-6 py-3 font-semibold text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900 block text-sm">{item.user_name}</span>
                                    {item.task_name ? (
                                        <span className="text-xs text-sky-600 font-medium truncate max-w-xs">{item.task_name}</span>
                                    ) : (
                                        item.user_email && <span className="text-xs text-gray-500">{item.user_email}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {type === 'kyc' ? (
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
                                            {item.status}
                                        </span>
                                    ) : type === 'task_progress' ? (
                                        <span className="font-black text-sky-600 text-sm">{item.progress}</span>
                                    ) : type === 'task_completed' ? (
                                        <span className="font-black text-emerald-600 text-sm">+${parseFloat(item.commission).toFixed(2)}</span>
                                    ) : (
                                        <span className="font-black text-gray-800 text-sm">
                                            ${parseFloat(item.amount).toFixed(2)}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-[10px] text-gray-400 font-bold uppercase text-right">{item.submitted}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">No pending items</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Dashboard" />

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Dashboard Overview</h1>
                        <p className="text-gray-500 font-medium">Monitoring platform health and user transactions.</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleClearCache}
                            disabled={isOptimizing}
                            className={`px-4 py-2 bg-white hover:bg-emerald-50 rounded-xl border border-gray-100 text-xs font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest shadow-sm transition-all flex items-center ${isOptimizing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isOptimizing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Optimizing...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-outlined text-sm mr-2">cleaning_services</span>
                                    System Optimized
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all group">
                            <div className={`${stat.color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform`}>
                                <span className="material-icons-outlined text-2xl">{stat.icon}</span>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Task Performance Metrics */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Task & Order Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {taskStats.map((stat) => (
                            <div key={stat.label} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 flex items-center space-x-4 hover:border-gray-300 transition-colors">
                                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                                    <span className="material-icons-outlined text-xl">{stat.icon}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-lg font-black text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Tasks Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <RecentTable
                            title="Recent Pending Users Task"
                            data={recentPendingTasks}
                            type="task_progress"
                            viewAllHref={route('admin.user-tasks.index')}
                        />
                        <RecentTable
                            title="Recent Completed Tasks"
                            data={recentCompletedTasks}
                            type="task_completed"
                            viewAllHref={route('admin.user-tasks.index')}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pending Deposits */}
                        <RecentTable
                            title="Recent Pending Deposits"
                            data={recentDeposits}
                            type="money"
                            viewAllHref={route('admin.deposits.index')}
                        />

                        {/* pending Withdrawals */}
                        <RecentTable
                            title="Recent Pending Withdrawals"
                            data={recentWithdrawals}
                            type="money"
                            viewAllHref={route('admin.withdrawals.index')}
                        />
                    </div>

                    {/* KYC Activity (Full Width) */}
                    <RecentTable
                        title="Recent KYC Pending"
                        data={recentActivity.filter(i => i.status === 'pending').slice(0, 5)}
                        type="kyc"
                        viewAllHref={route('admin.kyc.index')}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
