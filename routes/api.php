<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PageController;


// Authentication
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [LoginController::class, 'user'])->middleware('auth:sanctum');

// Users CRUD (Strictly for Admins)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('pages', PageController::class);
    Route::post('pages/reorder', [PageController::class, 'reorder']);
    Route::apiResource('tags', \App\Http\Controllers\Api\TagController::class);
    Route::apiResource('categories', \App\Http\Controllers\Api\CategoryController::class);
    Route::post('categories/reorder', [\App\Http\Controllers\Api\CategoryController::class, 'reorder']);
    Route::post('structure/reorder', [\App\Http\Controllers\Api\StructureController::class, 'reorder']);
    Route::get('/admin/stats', [\App\Http\Controllers\Api\AdminController::class, 'stats']);
    
    // Settings
    Route::get('/admin/settings', [\App\Http\Controllers\Api\SettingController::class, 'getSettings']);
    Route::post('/admin/settings', [\App\Http\Controllers\Api\SettingController::class, 'updateSettings']);
});

Route::get('/maintenance', [\App\Http\Controllers\Api\SettingController::class, 'checkMaintenance']);

Route::post('/upload', [\App\Http\Controllers\Api\MediaController::class, 'upload']);



// Utils
Route::get('/test', function () {
    return response()->json(['message' => 'Connecté à Laravel !']);
});
