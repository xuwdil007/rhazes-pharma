<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\ContentController;
use Illuminate\Support\Facades\Route;

Route::get('/content', [ContentController::class, 'index']);
Route::post('/admin/login', [AdminAuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/applications', [ApplicationController::class, 'store'])->middleware('throttle:30,1');
Route::post('/messages', [ContactMessageController::class, 'store'])->middleware('throttle:30,1');

Route::middleware('admin.token')->group(function (): void {
    Route::put('/content', [ContentController::class, 'update']);
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/messages', [ContactMessageController::class, 'index']);
    Route::get('/admin/credentials', [AdminAuthController::class, 'credentials']);
    Route::put('/admin/credentials', [AdminAuthController::class, 'updateCredentials']);
});
