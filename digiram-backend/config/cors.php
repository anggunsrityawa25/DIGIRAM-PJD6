<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // ✅ FIX: Izinkan domain Vercel (wildcard pattern) + localhost dev
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
    ],

    // ✅ Izinkan semua subdomain *.vercel.app
    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
