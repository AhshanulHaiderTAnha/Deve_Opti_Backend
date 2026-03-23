import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ children }) {
    const { auth, settings } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openSubmenus, setOpenSubmenus] = useState({});
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSubmenu = (name) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const navigation = [
        { name: 'Dashboard', href: route('admin.dashboard'), current: route().current('admin.dashboard'), icon: 'dashboard' },
        { name: 'Users', href: route('admin.users.index'), current: route().current('admin.users.*'), icon: 'people' },
        { name: 'KYC Review', href: route('admin.kyc.index'), current: route().current('admin.kyc.*'), icon: 'verified_user' },
        { name: 'Sellers', href: route('admin.sellers.index'), current: route().current('admin.sellers.*'), icon: 'storefront' },
        { name: 'Products', href: route('admin.products.index'), current: route().current('admin.products.*'), icon: 'inventory_2' },
        {
            name: 'Payments',
            icon: 'payments',
            current: route().current('admin.payment-methods.*') || route().current('admin.deposit-plans.*'),
            children: [
                { name: 'Payment Gateways', href: route('admin.payment-methods.index'), current: route().current('admin.payment-methods.*'), icon: 'settings_input_component' },
                { name: 'Commission Tiers', href: route('admin.commission-tiers.index'), current: route().current('admin.commission-tiers.*'), icon: 'military_tech' },
                { name: 'Deposit Plans', href: route('admin.deposit-plans.index'), current: route().current('admin.deposit-plans.*'), icon: 'account_balance' },
            ]
        },
        {
            name: 'Transactions',
            icon: 'sync_alt',
            current: route().current('admin.wallets.*') || route().current('admin.deposits.*') || route().current('admin.withdrawals.*'),
            children: [
                { name: 'Wallets', href: route('admin.wallets.index'), current: route().current('admin.wallets.*'), icon: 'account_balance_wallet' },
                { name: 'Deposits', href: route('admin.deposits.index'), current: route().current('admin.deposits.*'), icon: 'file_download' },
                { name: 'Withdrawals', href: route('admin.withdrawals.index'), current: route().current('admin.withdrawals.*'), icon: 'file_upload' },
            ]
        },
        {
            name: 'Tasks & Orders',
            icon: 'assignment',
            current: route().current('admin.order-tasks.*') || route().current('admin.user-tasks.*'),
            children: [
                { name: 'Task Templates', href: route('admin.order-tasks.index'), current: route().current('admin.order-tasks.*'), icon: 'format_list_bulleted' },
                { name: 'User Assignments', href: route('admin.user-tasks.index'), current: route().current('admin.user-tasks.*'), icon: 'assignment_ind' },
            ]
        },
        { name: 'Support Tickets', href: route('admin.support-tickets.index'), current: route().current('admin.support-tickets.*'), icon: 'confirmation_number' },
        { name: 'Success Stories', href: route('admin.success-stories.index'), current: route().current('admin.success-stories.*'), icon: 'auto_awesome' },
        { name: 'FAQs', href: route('admin.faqs.index'), current: route().current('admin.faqs.*'), icon: 'quiz' },
        { name: 'Subscribers', href: route('admin.subscribers.index'), current: route().current('admin.subscribers.*'), icon: 'mail' },
        {
            name: 'System Activity',
            icon: 'settings_suggest',
            current: route().current('admin.announcements.*') || route().current('admin.activity-logs.*') || route().current('admin.settings.*'),
            children: [
                { name: 'Announcements', href: route('admin.announcements.index'), current: route().current('admin.announcements.*'), icon: 'campaign' },
                { name: 'Activity Logs', href: route('admin.activity-logs.index'), current: route().current('admin.activity-logs.*'), icon: 'history' },
                { name: 'Settings', href: route('admin.settings.index'), current: route().current('admin.settings.*'), icon: 'settings' },
            ]
        },
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

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => (
                        <div key={item.name}>
                            {item.children ? (
                                <>
                                    <button
                                        onClick={() => toggleSubmenu(item.name)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${item.current ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <span className="material-icons-outlined text-xl">{item.icon}</span>
                                            {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                                        </div>
                                        {isSidebarOpen && (
                                            <span className={`material-icons-outlined text-sm transition-transform ${openSubmenus[item.name] || item.current ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        )}
                                    </button>
                                    {(openSubmenus[item.name] || item.current) && isSidebarOpen && (
                                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-orange-100 pl-2">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={`flex items-center p-2 rounded-lg text-sm transition-colors ${child.current ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'}`}
                                                >
                                                    <span className="material-icons-outlined text-lg mr-3">{child.icon}</span>
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-3 rounded-lg transition-colors ${item.current ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <span className="material-icons-outlined text-xl">{item.icon}</span>
                                    {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                                </Link>
                            )}
                        </div>
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

                    <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 p-2 rounded-xl transition-colors"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">{auth?.user?.name || 'Admin User'}</p>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{auth?.user?.role || 'Administrator'}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
                                {auth?.user?.name?.[0] || 'A'}
                            </div>
                            <span className="material-icons-outlined text-gray-400 text-sm">expand_more</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileDropdownOpen && (
                            <div className="absolute top-[110%] right-0 mt-1 w-48 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{auth?.user?.name || 'Admin User'}</p>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">{auth?.user?.role || 'Administrator'}</p>
                                </div>

                                <Link
                                    href={route('admin.settings.index')}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                    <span className="material-icons-outlined text-lg mr-3">settings</span>
                                    Settings
                                </Link>

                                <div className="border-t border-gray-100 my-1"></div>

                                <Link
                                    href={route('admin.logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <span className="material-icons-outlined text-lg mr-3">logout</span>
                                    Logout
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
