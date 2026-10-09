<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index(): JsonResponse
    {
        $items = ContactMessage::query()->orderByDesc('submitted_at')->get()->map(fn (ContactMessage $item): array => [
            'id' => $item->id,
            'submittedAt' => $item->submitted_at,
            'name' => $item->name,
            'email' => $item->email,
            'subject' => $item->subject,
            'message' => $item->message,
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
            'subject' => ['required', 'string', 'max:180'],
            'message' => ['required', 'string', 'max:4000'],
        ]);

        ContactMessage::query()->updateOrCreate(['id' => $data['id']], [
            'submitted_at' => $data['submittedAt'],
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'subject' => trim($data['subject']),
            'message' => trim($data['message']),
        ]);

        return response()->json(['ok' => true], 201);
    }
}
