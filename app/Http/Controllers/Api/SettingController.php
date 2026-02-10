<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // Public: Check maintenance status
    public function checkMaintenance()
    {
        $maintenance = SystemSetting::where('key', 'maintenance_mode')->first();
        $message = SystemSetting::where('key', 'maintenance_reason')->first();

        return response()->json([
            'maintenance' => $maintenance ? filter_var($maintenance->value, FILTER_VALIDATE_BOOLEAN) : false,
            'message' => $message ? $message->value : '',
        ]);
    }

    // Admin: Get all settings
    public function getSettings(Request $request)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $settings = SystemSetting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    // Admin: Update settings
    public function updateSettings(Request $request)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Settings updated']);
    }
}
