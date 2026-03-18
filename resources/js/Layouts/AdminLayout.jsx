import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    const { auth, settings } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navigation = [
        { name: 'Dashboard', href: route('admin.dashboard'), current: route().current('admin.dashboard'), icon: 'dashboard' },
        { name: 'Sellers', href: route('admin.sellers.index'), current: route().current('admin.sellers.*'), icon: 'storefront' },
        { name: 'Users', href: route('admin.users.index'), current: route().current('admin.users.*'), icon: 'people' },
        { name: 'KYC Review', href: route('admin.kyc.index'), current: route().current('admin.kyc.*'), icon: 'verified_user' },
        { name: 'Settings', href: route('admin.settings.index'), current: route().current('admin.settings.*'), icon: 'settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm z-20`}>
                <div className="h-16 flex items-center px-6 border-b border-gray-100 overflow-hidden">
                    {settings?.site_logo ? (
                        <img 
                            src={settings.site_logo} 
                            alt={settings.system_name} 
                            className={`transition-all ${isSidebarOpen ? 'h-8' : 'h-6'}`} 
                        />
                    ) : (
                        <span className="text-orange-500 font-black text-xl tracking-tighter shrink-0">{isSidebarOpen ? settings?.system_name || 'DEVE OPTI' : (settings?.system_name?.[0] || 'D')}</span>
                    )}
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center p-3 rounded-lg transition-colors ${
                                item.current ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span className="material-icons-outlined text-xl">{item.icon}</span>
                            {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link
                        href={route('admin.logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <span className="material-icons-outlined text-xl">logout</span>
                        {isSidebarOpen && <span className="ml-3 font-medium">Logout</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700">
                        <span className="material-icons-outlined text-2xl">menu</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{auth?.user?.name || 'Admin User'}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{auth?.user?.role || 'Administrator'}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
                            {auth?.user?.name?.[0] || 'A'}
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
