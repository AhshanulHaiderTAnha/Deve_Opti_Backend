import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function BlogIndex({ blogs }) {
    const deleteBlog = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this blog post!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#111827',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3',
                cancelButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.blogs.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Blog post has been deleted.',
                            icon: 'success',
                            confirmButtonColor: '#111827',
                            customClass: {
                                popup: 'rounded-[2rem]',
                                confirmButton: 'rounded-xl font-black uppercase tracking-widest text-xs px-6 py-3'
                            }
                        });
                    }
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Blog Management" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Blog Management</h1>
                        <p className="text-gray-500 font-medium">Create and manage your articles for the public site.</p>
                    </div>
                    <Link
                        href={route().has('admin.blogs.create') ? route('admin.blogs.create') : '/admin/blogs/create'}
                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold flex items-center hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        <span className="material-icons-outlined mr-2">add</span>
                        Create New Post
                    </Link>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Image</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Author</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {blogs.data.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            {blog.image_url ? (
                                                <img src={blog.image_url} className="h-12 w-20 rounded-xl object-cover border border-gray-100 shadow-sm" alt={blog.title} />
                                            ) : (
                                                <div className="h-12 w-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                                                    <span className="material-icons-outlined text-sm">image</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{blog.title}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">/{blog.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter bg-gray-100 px-3 py-1 rounded-full">{blog.author?.name || 'Unknown'}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                blog.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                                {blog.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-gray-400 tracking-tight">
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    href={route().has('admin.blogs.edit') ? route('admin.blogs.edit', blog.id) : `/admin/blogs/${blog.id}/edit`}
                                                    className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                                                >
                                                    <span className="material-icons-outlined text-sm">edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => deleteBlog(blog.id)}
                                                    className="h-9 w-9 bg-red-50 rounded-xl flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-100 transition-all"
                                                >
                                                    <span className="material-icons-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (Simplified) */}
                <div className="flex justify-between items-center px-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Showing {blogs.data.length} of {blogs.total} articles
                    </p>
                    <div className="flex space-x-2">
                        {blogs.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                        link.active ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white text-gray-400 hover:bg-gray-50'
                                    }`}
                                />
                            ) : (
                                <span
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="px-4 py-2 rounded-xl text-xs font-black bg-white text-gray-200 cursor-not-allowed opacity-50"
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
