<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'total_users' => User::count(),
            'admins_count' => User::where('role', 'admin')->count(),
            'users_count' => User::where('role', 'user')->count(),
            'total_pages' => Page::count(),
            'latest_users' => User::orderBy('created_at', 'desc')->take(5)->get(),
        ]);
    }
}
