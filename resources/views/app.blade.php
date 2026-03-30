<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $favicon = \App\Models\Setting::get('site_favicon', \App\Models\Setting::get('site_logo'));
            $faviconUrl = $favicon ? asset('storage/' . $favicon) : asset('assets/branding/favicon.png');
        @endphp
        
        <link rel="icon" type="image/x-icon" href="{{ $faviconUrl }}">
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @if($ga_id = \App\Models\Setting::get('google_analytics_id'))
            <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $ga_id }}"></script>
            <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $ga_id }}');
            </script>
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <style>
            body {
                font-family: 'Inter', sans-serif;
                margin: 0;
            }
            #preloader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #fff;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                transition: opacity 0.5s ease;
            }
            .loader-logo {
                width: 80px;
                height: 80px;
                margin-bottom: 20px;
                animation: pulse 1.5s infinite ease-in-out;
            }
            .loader-bar {
                width: 150px;
                height: 4px;
                background: #f1f5f9;
                border-radius: 10px;
                overflow: hidden;
                position: relative;
            }
            .loader-bar::after {
                content: '';
                position: absolute;
                left: -100%;
                width: 100%;
                height: 100%;
                background: #f97316;
                animation: loading 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
            }
            @keyframes loading {
                0% { left: -100%; }
                50% { left: 0; }
                100% { left: 100%; }
            }
            .fade-out {
                opacity: 0;
                pointer-events: none;
            }
        </style>
    </head>
    <body class="antialiased bg-gray-50">
        <div id="preloader">
             <div className="loader-logo">
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="6" fill="#f97316"/>
                    <path d="M7 12L10 15L17 8" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                 </svg>
             </div>
             <div class="loader-bar"></div>
             <p style="margin-top: 15px; font-weight: 800; color: #1e293b; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Stockrevive</p>
        </div>
        @inertia

        <script>
            window.addEventListener('load', function() {
                const preloader = document.getElementById('preloader');
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }, 300);
            });
        </script>
    </body>
</html>
