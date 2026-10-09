<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(): JsonResponse
    {
        $items = JobApplication::query()->orderByDesc('submitted_at')->get()->map(fn (JobApplication $item): array => [
            'id' => $item->id,
            'submittedAt' => $item->submitted_at,
            'name' => $item->name,
            'email' => $item->email,
            'phone' => $item->phone,
            'direction' => $item->direction,
            'about' => $item->about,
        ]);

        return response()->json($items)->header('Cache-Control', 'no-store');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => ['required', 'string', 'max:100'],
            'submittedAt' => ['required', 'string', 'max:60'],
            'name' => ['required', 'string', 'max:180'],
            'email' => ['required', 'email', 'max:240'],
            'phone' => ['required', 'string', 'max:80'],
            'direction' => ['required', 'string', 'max:180'],
            'about' => ['required', 'string', 'max:4000'],
        ]);

        JobApplication::query()->updateOrCreate(['id' => $data['id']], [
            'submitted_at' => $data['submittedAt'],
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'phone' => trim($data['phone']),
            'direction' => trim($data['direction']),
            'about' => trim($data['about']),
        ]);

        return response()->json(['ok' => true], 201);
    }
}
