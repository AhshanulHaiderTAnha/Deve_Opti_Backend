import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import RichTextEditor from '@/Components/RichTextEditor';

export default function BlogForm({ blog }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: blog ? 'PUT' : 'POST',
        title: blog?.title || '',
        content: blog?.content || '',
        status: blog?.status || 'draft',
        image: null,
        meta_title: blog?.meta_title || '',
        meta_description: blog?.meta_description || '',
        meta_keywords: blog?.meta_keywords || '',
    });

    const [imagePreview, setImagePreview] = React.useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const url = blog 
            ? (route().has('admin.blogs.update') ? route('admin.blogs.update', blog.id) : `/admin/blogs/${blog.id}`)
            : (route().has('admin.blogs.store') ? route('admin.blogs.store') : '/admin/blogs');

        // We use post for both because files don't work with put in Laravel
        // The _method field in 'data' handles the PUT spoofing
        post(url, {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <Head title={blog ? 'Edit Blog' : 'Create Blog'} />

            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            {blog ? 'Edit Blog Post' : 'Create Blog Post'}
                        </h1>
                        <p className="text-gray-500 font-medium">Craft a compelling story for your audience.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-base"
                                    placeholder="Enter blog title..."
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Content</label>
                                <div className="rounded-3xl border border-gray-50 overflow-hidden">
                                    <RichTextEditor
                                        value={data.content}
                                        onChange={content => setData('content', content)}
                                    />
                                </div>
                                {errors.content && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.content}</p>}
                            </div>
                        </div>

                        {/* SEO Section */}
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center">
                                <span className="material-icons-outlined mr-2 text-orange-500">search</span>
                                SEO Settings
                            </h3>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Meta Title</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                    placeholder="Brief meta title..."
                                    value={data.meta_title}
                                    onChange={e => setData('meta_title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Meta Description</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-medium text-sm h-32 resize-none"
                                    placeholder="A short summary for search engines..."
                                    value={data.meta_description}
                                    onChange={e => setData('meta_description', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Keywords</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm"
                                    placeholder="comma, separated, keywords"
                                    value={data.meta_keywords}
                                    onChange={e => setData('meta_keywords', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Publishing</h3>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                <select
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 font-bold text-sm appearance-none"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-gray-200"
                                >
                                    {blog ? 'Update Blog Post' : 'Publish Blog Post'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Featured Image</h3>
                            
                            <div className="space-y-4">
                                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-100 aspect-video flex flex-col items-center justify-center hover:bg-gray-50 transition-all cursor-pointer">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview ? (
                                        <img src={imagePreview} label="New Preview" className="w-full h-full object-cover" />
                                    ) : blog?.image_url ? (
                                        <img src={blog.image_url} label="Existing Image" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <span className="material-icons-outlined text-gray-300 mb-2">cloud_upload</span>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Upload Image</p>
                                        </div>
                                    )}
                                </div>
                                {errors.image && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.image}</p>}
                                <p className="text-[10px] text-gray-400 font-medium text-center">Recommended size: 1200x630 (aspect ratio 1.91:1)</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
