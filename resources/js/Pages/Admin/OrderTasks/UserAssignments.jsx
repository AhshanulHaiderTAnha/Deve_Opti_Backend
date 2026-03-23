import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function UserAssignments({ assignments, users, tasks }) {
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        order_task_id: ''
    });

    const openAssignModal = () => {
        reset();
        setIsAssignModalOpen(true);
    };

    const submitAssignment = (e) => {
        e.preventDefault();
        post(route('admin.user-tasks.store'), {
            onSuccess: () => {
                setIsAssignModalOpen(false);
                reset();
                Swal.fire('Assigned!', 'Task assigned to user successfully.', 'success');
            }
        });
    };

    const deleteAssignment = (id) => {
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
                router.delete(route('admin.user-tasks.destroy', id), {
                    onSuccess: () => Swal.fire('Cancelled!', 'System removed assignment.', 'success')
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Task Assignments" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">User Assignments</h1>
                        <p className="text-gray-500 font-medium text-sm text-neutral-400">See which users are actively completing tasks or assign new tasks.</p>
                    </div>
                    <button 
                        onClick={openAssignModal}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons-outlined mr-2">person_add</span>
                        Assign Task to User
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Task Batch Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Progress</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Earned Commission</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {assignments.data.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{assignment.user?.name}</span>
                                                <span className="text-xs text-gray-500">{assignment.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md text-xs">{assignment.order_task?.title}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 flex items-center relative overflow-hidden" style={{ minWidth: '100px' }}>
                                                 <div 
                                                    className="bg-orange-500 h-2.5 rounded-full z-10" 
                                                    style={{ width: `${(assignment.completed_orders / (assignment.order_task?.required_orders || 1)) * 100}%` }}
                                                 ></div>
                                                 <span className="absolute inset-0 flex justify-center items-center text-[9px] font-black mix-blend-difference text-white/50">{assignment.completed_orders}/{assignment.order_task?.required_orders}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-green-600">${parseFloat(assignment.total_earned_commission).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                assignment.status === 'completed' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {assignment.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {assignment.status === 'in_progress' ? (
                                                <button onClick={() => deleteAssignment(assignment.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Assignment">
                                                    <span className="material-icons-outlined text-[20px]">cancel</span>
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Done</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {assignments.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="material-icons-outlined text-4xl text-gray-300 mb-2">assignment_ind</span>
                                                <span className="text-gray-500 font-medium">No users assigned to tasks yet.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Assign Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
                         <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-black text-gray-900 tracking-tight">Assign Task</h2>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={submitAssignment} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select User</label>
                                <select 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                    value={data.user_id}
                                    onChange={e => setData('user_id', e.target.value)}
                                >
                                    <option value="">-- Choose User --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                                {errors.user_id && <p className="text-red-500 text-xs font-bold">{errors.user_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Task Template</label>
                                <select 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm"
                                    value={data.order_task_id}
                                    onChange={e => setData('order_task_id', e.target.value)}
                                >
                                    <option value="">-- Choose Active Task --</option>
                                    {tasks.map(t => (
                                        <option key={t.id} value={t.id}>{t.title} ({t.required_orders} items)</option>
                                    ))}
                                </select>
                                {errors.order_task_id && <p className="text-red-500 text-xs font-bold">{errors.order_task_id}</p>}
                            </div>

                            <button type="submit" disabled={processing} className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all disabled:opacity-50 mt-4 flex justify-center items-center">
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Assigning Task...
                                    </>
                                ) : 'Assign Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
