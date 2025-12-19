<?php

namespace App\Http\Controllers\Config;

use App\Http\Controllers\Controller;

class ReverbConfigController extends Controller
{
    public function ReverbConfigs()
    {
        $configs = [
            'VITE_REVERB_APP_KEY' => env('REVERB_APP_KEY', ''),
            'VITE_REVERB_HOST' => env('REVERB_HOST', ''),
            'VITE_REVERB_PORT' => env('REVERB_PORT', ''),
            'VITE_REVERB_SCHEME' => env('REVERB_SCHEME', 'http'),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Reverb config carregada.',
            'data' => $configs,
            'errors' => null,
        ]);
    }
}
