import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        // The 'route' function is now globally available via ziggy-js in app.jsx
        post(window.route ? window.route('admin.login.store') : '/admin/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-40"></div>

            <Head title="Admin Login" />

            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/20 relative z-10">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-3xl shadow-lg shadow-orange-200 mb-6 group transition-all hover:scale-105">
                        <span className="material-icons-outlined text-white text-4xl">admin_panel_settings</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">DEVE <span className="text-orange-500">OPTI</span></h2>
                    <p className="mt-3 text-slate-500 font-medium">
                        Secure Administration Access
                    </p>
                </div>

                <form className="mt-10 space-y-6" onSubmit={submit}>
                    <div className="space-y-5">
                        <div className="relative group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                    <span className="material-icons-outlined text-xl">mail</span>
                                </span>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none"
                                    placeholder="admin@deveopti.com"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">{errors.email}</p>}
                        </div>

                        <div className="relative group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                    <span className="material-icons-outlined text-xl">lock</span>
                                </span>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">{errors.password}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                id="remember"
                                onChange={e => setData('remember', e.target.checked)}
                                className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-slate-200 rounded-lg transition-all cursor-pointer"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 font-semibold cursor-pointer select-none">Remember me</label>
                        </div>
                        <a href="#" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-all">Forgot?</a>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className={`group relative w-full flex justify-center py-4 px-6 border-0 text-md font-black rounded-2xl text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all shadow-lg shadow-orange-200/50 ${processing ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                        >
                            {processing ? (
                                <span className="flex items-center font-bold">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    AUTHENTICATING...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    SIGN IN TO DASHBOARD
                                    <span className="material-icons-outlined ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                    <img src="/assets/branding/partner_logos.png" alt="Partner Logos" className="h-10 object-contain" />
                </div>
            </div>

            {/* Footer */}
            <p className="absolute bottom-8 left-0 right-0 text-center text-slate-400 text-sm font-medium">
                &copy; 2026 DEVE OPTI System. Built with Premium Performance.
            </p>
        </div>
    );
}
