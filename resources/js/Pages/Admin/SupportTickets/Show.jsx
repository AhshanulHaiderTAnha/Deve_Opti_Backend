import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function SupportTicketShow({ ticket }) {
    const messagesEndRef = useRef(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        message: '',
        attachment: null
    });

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

    return (
        <AdminLayout>
            <Head title={`Ticket ${ticket.ticket_id}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center space-x-6">
                        <Link href={route('admin.support-tickets.index')} className="h-12 w-12 bg-gray-50 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl flex items-center justify-center transition-all">
                            <span className="material-icons-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-3 mb-1">
                                <h1 className="text-xl font-black text-gray-900 tracking-tight">{ticket.subject}</h1>
                                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full">{ticket.status}</span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Ticket ID: {ticket.ticket_id} • User: {ticket.user?.name}
                            </p>
                        </div>
                    </div>
                    {ticket.status !== 'closed' && (
                        <button 
                            onClick={closeTicket}
                            className="px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Close Ticket
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm flex flex-col h-[700px] overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-gray-50/20">
                        {ticket.messages.map((msg, idx) => (
                            <div key={msg.id} className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] space-y-2 ${msg.is_admin_reply ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`p-6 rounded-[2rem] text-sm font-medium shadow-sm border ${
                                        msg.is_admin_reply 
                                        ? 'bg-gray-900 text-white border-gray-800 rounded-br-none' 
                                        : 'bg-white text-gray-700 border-gray-100 rounded-bl-none'
                                    }`}>
                                        {msg.message}
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
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mx-2">
                                        {new Date(msg.created_at).toLocaleString([], {hour: '2-digit', minute:'2-digit'})} • {msg.user?.name || 'System'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {ticket.status !== 'closed' ? (
                        <form onSubmit={submitReply} className="p-8 border-t border-gray-100 bg-white">
                            <div className="flex flex-col space-y-4">
                                <div className="relative">
                                    <textarea 
                                        className="w-full p-6 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm resize-none h-32"
                                        placeholder="Type your response here..."
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                    ></textarea>
                                    <div className="absolute right-6 bottom-6 flex items-center space-x-3">
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10" 
                                                onChange={e => setData('attachment', e.target.files[0])}
                                            />
                                            <button type="button" className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${data.attachment ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}>
                                                <span className="material-icons-outlined">{data.attachment ? 'check_circle' : 'attach_file'}</span>
                                            </button>
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={processing}
                                            className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-100 transition-all flex items-center"
                                        >
                                            <span className="material-icons mr-2 text-sm">send</span>
                                            Send Reply
                                        </button>
                                    </div>
                                </div>
                                {errors.message && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest pl-4">{errors.message}</p>}
                            </div>
                        </form>
                    ) : (
                        <div className="p-10 bg-gray-50 text-center">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-center">
                                <span className="material-icons-outlined mr-2">lock</span>
                                This ticket was closed on {new Date(ticket.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
