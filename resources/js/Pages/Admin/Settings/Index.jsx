import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function SettingIndex({ settings: groupedSettings }) {
    const { settings: globalSettings } = usePage().props;
    const [activeTab, setActiveTab] = useState('general');

    // Flatten settings for useForm
    const initialData = {};
    Object.values(groupedSettings).forEach(group => {
        group.forEach(setting => {
            initialData[setting.key] = setting.value || '';
        });
    });

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm(initialData);

    const tabs = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'branding', label: 'Branding', icon: 'brush' },
        { id: 'seo', label: 'SEO Config', icon: 'search' },
        { id: 'email', label: 'Mail Server', icon: 'mail' },
    ];

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const renderInput = (setting) => {
        const key = setting.key;
        const type = setting.type;

        if (type === 'image') {
            return (
                <div className="space-y-4">
                    <div className="flex items-center space-x-6">
                        <div className="shrink-0">
                            <img
                                className="h-16 w-16 object-contain rounded-xl border-2 border-slate-100 bg-slate-50 p-2"
                                src={data[key] instanceof File ? URL.createObjectURL(data[key]) : data[key]}
                                alt={setting.key}
                            />
                        </div>
                        <label className="block">
                            <span className="sr-only">Choose profile photo</span>
                            <input
                                type="file"
                                onChange={(e) => setData(key, e.target.files[0])}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-all cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            );
        }

        if (type === 'text') {
            return (
                <textarea
                    value={data[key]}
                    onChange={(e) => setData(key, e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none min-h-[100px]"
                />
            );
        }

        return (
            <input
                type="text"
                value={data[key]}
                onChange={(e) => setData(key, e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
            />
        );
    };

    return (
        <AdminLayout>
            <Head title="System Settings" />

            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
                    <p className="text-slate-500 font-medium mt-1">Configure your platform's core identity and integrations.</p>
                </div>

                {recentlySuccessful && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-4 rounded-2xl font-bold flex items-center animate-in fade-in slide-in-from-top-4">
                        <span className="material-icons-outlined mr-2">check_circle</span>
                        Settings updated successfully!
                    </div>
                )}

                <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-slate-50 space-x-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                                activeTab === tab.id
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-[1.02]'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <span className="material-icons-outlined text-sm mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden transition-all duration-300">
                    <form onSubmit={submit} className="p-10 space-y-10">
                        {groupedSettings[activeTab]?.map((setting) => (
                            <div key={setting.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-wider ml-1">
                                        {setting.key.replace(/_/g, ' ')}
                                    </label>
                                    <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md uppercase">
                                        {setting.group}
                                    </span>
                                </div>
                                {renderInput(setting)}
                                {errors[setting.key] && (
                                    <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors[setting.key]}</p>
                                )}
                            </div>
                        ))}

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <p className="text-xs text-slate-400 font-medium">Last saved: Just now</p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'SAVING CHANGES...' : 'SAVE CONFIGURATION'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
