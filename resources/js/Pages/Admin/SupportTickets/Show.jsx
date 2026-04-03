import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useRef, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function Show({ ticket }) {
    const messagesEndRef = useRef(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        attachment: null
    });
    const [editingMessage, setEditingMessage] = useState(null);
    const [editValue, setEditValue] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [ticket.messages]);

    const submitReply = (e) => {
        e.preventDefault();
        post(route('admin.support-tickets.reply', ticket.id), {
            onSuccess: () => {
                reset();
                scrollToBottom();
            },
        });
    };

    const handleFileChange = (e) => {
        setData('attachment', e.target.files[0]);
    };

    const closeTicket = () => {
        Swal.fire({
            title: 'Close Ticket?',
            text: "Are you sure you want to mark this ticket as closed?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Close it',
            background: '#ffffff',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.support-tickets.close', ticket.id), {}, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Closed!',
                            text: 'The ticket has been marked as closed successfully.',
                            icon: 'success',
                            confirmButtonColor: '#f59e0b'
                        });
                    }
                });
            }
        });
    };

    const startEdit = (msg) => {
        setEditingMessage(msg.id);
        setEditValue(msg.message);
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setEditValue('');
    };

    const submitEdit = (id) => {
        router.post(route('admin.support-tickets.message.update', id), {
            message: editValue
        }, {
            onSuccess: () => {
                cancelEdit();
                Swal.fire({
                    title: 'Updated!',
                    text: 'Message has been updated successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#ffffff',
                });
            },
            onError: (errors) => {
                Swal.fire({
                    title: 'Error!',
                    text: errors.message || 'Failed to update message.',
                    icon: 'error',
                    confirmButtonColor: '#e11d48'
                });
            }
        });
    };

    const deleteMessage = (id) => {
        Swal.fire({
            title: 'Delete Message?',
            text: "Are you sure you want to delete this message? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, Delete',
            background: '#ffffff',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.support-tickets.message.delete', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Message has been deleted.',
                            icon: 'success',
                            confirmButtonColor: '#e11d48'
                        });
                    }
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title={`Ticket ${ticket.ticket_id}`} />
            
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button onClick={() => window.history.back()} className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                            <span className="material-icons-outlined">arrow_back</span>
                        </button>
                        <div>
                            <div className="flex items-center space-x-3 mb-1">
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{ticket.subject}</h1>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    ticket.status === 'open' ? 'bg-emerald-50 text-emerald-600' :
                                    ticket.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Ticket ID: {ticket.ticket_id} • User: {ticket.user.name}
                            </p>
                        </div>
                    </div>
                    {ticket.status !== 'closed' && (
                        <button onClick={closeTicket} className="px-8 py-3 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all">
                            Close Ticket
                        </button>
                    )}
                </div>

                {/* Chat Section */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-50 overflow-hidden flex flex-col min-h-[600px]">
                    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[600px] scrollbar-hide bg-gray-50/30">
                        {ticket.messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] space-y-2 ${msg.is_admin_reply ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`p-6 rounded-[2rem] text-sm font-medium shadow-sm border group relative ${
                                        msg.is_admin_reply 
                                        ? 'bg-gray-900 text-white border-gray-800 rounded-br-none' 
                                        : 'bg-white text-gray-700 border-gray-100 rounded-bl-none'
                                    }`}>
                                        {editingMessage === msg.id ? (
                                            <div className="space-y-4">
                                                <textarea 
                                                    className="w-full p-4 bg-gray-800 border-none rounded-2xl text-white focus:ring-1 focus:ring-orange-500/50 text-sm"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                />
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={cancelEdit} className="px-3 py-1 bg-gray-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Cancel</button>
                                                    <button onClick={() => submitEdit(msg.id)} className="px-3 py-1 bg-orange-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {msg.message}
                                                {msg.is_admin_reply && !msg.read_at && (
                                                    <div className="absolute right-2 -top-2 hidden group-hover:flex space-x-1">
                                                        <button onClick={() => startEdit(msg)} className="h-6 w-6 bg-gray-800 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all shadow-lg border border-gray-700">
                                                            <span className="material-icons-outlined text-[10px]">edit</span>
                                                        </button>
                                                        <button onClick={() => deleteMessage(msg.id)} className="h-6 w-6 bg-gray-800 text-rose-400 hover:text-rose-300 rounded-lg flex items-center justify-center transition-all shadow-lg border border-gray-700">
                                                            <span className="material-icons-outlined text-[10px]">delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {msg.attachment_url && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <a href={msg.attachment_url} target="_blank" className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:underline">
                                                    <span className="material-icons-outlined text-sm">attachment</span>
                                                    <span>View Attachment</span>
                                                </a>
                                                <img src={msg.attachment_url} className="mt-2 rounded-xl max-h-48 w-auto border border-white/5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 px-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(msg.created_at).toLocaleString([], {hour: '2-digit', minute:'2-digit'})} • {msg.user?.name || 'System'}
                                        </span>
                                        {msg.is_admin_reply && (
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${msg.read_at ? 'text-emerald-500' : 'text-gray-300'}`}>
                                                {msg.read_at ? 'Read' : 'Sent'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Form */}
                    {ticket.status !== 'closed' && (
                        <div className="p-8 bg-white border-t border-gray-50">
                            <form onSubmit={submitReply} className="relative bg-gray-50/50 p-4 rounded-[2.5rem] border border-gray-100 flex items-center space-x-4">
                                <input
                                    type="text"
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    placeholder="Type your response here..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 px-4"
                                    required
                                />
                                <div className="flex items-center space-x-3">
                                    <label className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
                                        <span className="material-icons-outlined">attachment</span>
                                        <input type="file" className="hidden" onChange={handleFileChange} />
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-10 py-4 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                    >
                                        Send Reply
                                    </button>
                                </div>
                            </form>
                            {errors.message && <div className="text-rose-500 text-[10px] font-bold mt-2 ml-8 uppercase tracking-widest">{errors.message}</div>}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
