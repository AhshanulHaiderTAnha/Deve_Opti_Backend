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
        { id: 'general', label: 'General', icon: 'settings', desc: 'System name and core configs' },
        { id: 'branding', label: 'Branding', icon: 'auto_awesome', desc: 'Logo, icon and visual identity' },
        { id: 'seo', label: 'SEO & Meta', icon: 'language', desc: 'Search engine optimization' },
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
                <div className="relative group max-w-sm">
                    <div className="flex items-center p-4 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 group-hover:border-orange-200 transition-all">
                        <div className="shrink-0 relative">
                            <img
                                className="h-20 w-20 object-contain rounded-2xl bg-white shadow-sm border border-slate-100 p-2"
                                src={data[key] instanceof File ? URL.createObjectURL(data[key]) : data[key]}
                                alt={setting.key}
                            />
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-icons-outlined text-sm">cloud_upload</span>
                            </div>
                        </div>
                        <div className="ml-6 flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Click to replace</p>
                            <input
                                type="file"
                                onChange={(e) => setData(key, e.target.files[0])}
                                className="block w-full text-xs text-slate-500 file:hidden cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'text') {
            return (
                <textarea
                    value={data[key]}
                    onChange={(e) => setData(key, e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-3xl text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white transition-all outline-none min-h-[120px] resize-none shadow-sm"
                />
            );
        }

        return (
            <input
                type="text"
                value={data[key]}
                onChange={(e) => setData(key, e.target.value)}
                className="w-full px-6 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-3xl text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white transition-all outline-none shadow-sm"
            />
        );
    };

    return (
        <AdminLayout>
            <Head title="System Settings" />

            <div className="max-w-6xl mx-auto pl-4">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="h-1 w-8 bg-orange-500 rounded-full"></span>
                            <span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Administrator Only</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center">
                            Core Configurations
                            <span className="ml-4 px-3 py-1 bg-slate-900 text-white text-[10px] rounded-full uppercase tracking-tighter shadow-xl">v2.0</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Manage your platform global variables and identity assets.</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-10">
                    {/* Left Sidebar Tabs */}
                    <div className="col-span-12 lg:col-span-3 space-y-3">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full group text-left p-5 rounded-[2rem] transition-all duration-300 flex items-center ${
                                    activeTab === tab.id
                                        ? 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.06)] scale-[1.05] border border-slate-100 z-10'
                                        : 'hover:bg-white/50 text-slate-400'
                                }`}
                            >
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 rotate-6' 
                                    : 'bg-slate-100 group-hover:bg-slate-200'
                                }`}>
                                    <span className="material-icons-outlined">{tab.icon}</span>
                                </div>
                                <div className="ml-4 truncate">
                                    <p className={`text-xs font-black uppercase tracking-wider ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {tab.label}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{tab.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Right Form Content */}
                    <div className="col-span-12 lg:col-span-9 relative">
                        {recentlySuccessful && (
                            <div className="absolute -top-16 right-0 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-200 font-black text-xs flex items-center animate-in fade-in slide-in-from-right-4">
                                <span className="material-icons-outlined mr-2 text-sm text-lime-100">task_alt</span>
                                ALL CHANGES SYNCED SUCCESSFULLY
                            </div>
                        )}

                        <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden min-h-[500px] flex flex-col">
                            <div className="p-10 flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="pb-8 border-b border-slate-50">
                                        <h3 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                                            {activeTab.replace(/_/g, ' ')} <span className="text-slate-300 ml-1">Settings</span>
                                        </h3>
                                        <p className="text-slate-400 text-xs font-medium mt-1">Configure fields related to the {activeTab} operations.</p>
                                    </div>

                                    <div className="space-y-8">
                                        {groupedSettings[activeTab]?.map((setting) => (
                                            <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                                <div className="pt-2">
                                                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] ml-1">
                                                        {setting.key.replace(/_/g, ' ')}
                                                    </label>
                                                    <div className="mt-1 flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">
                                                        <span className="h-1 w-1 bg-orange-300 rounded-full mr-1.5"></span>
                                                        {setting.type}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    {renderInput(setting)}
                                                    {errors[setting.key] && (
                                                        <p className="text-rose-500 text-[10px] font-black mt-2 bg-rose-50 px-3 py-1 rounded-lg inline-block border border-rose-100">{errors[setting.key]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex bg-white px-4 py-2 rounded-xl border border-slate-100 items-center shadow-sm">
                                    <span className="material-icons-outlined text-orange-500 text-sm mr-2 animate-pulse">info</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Settings will be shared globally across the frontend.</span>
                                </div>
                                <button
                                    onClick={submit}
                                    disabled={processing}
                                    className="px-12 py-5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center"
                                >
                                    {processing ? (
                                        <>
                                            <span className="material-icons-outlined text-sm mr-2 animate-spin">sync</span>
                                            UPLOADING...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons-outlined text-sm mr-2">save</span>
                                            UNIFY CHANGES
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
