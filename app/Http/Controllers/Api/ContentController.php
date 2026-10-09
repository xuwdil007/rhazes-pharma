<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(SiteContent::query()->pluck('value', 'key'))
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    public function update(Request $request): JsonResponse
    {
        $content = collect($request->json()->all())
            ->filter(fn (mixed $value, mixed $key): bool => is_string($key) && is_string($value))
            ->mapWithKeys(fn (string $value, string $key): array => [
                mb_substr($key, 0, 300) => mb_substr($value, 0, 12 * 1024 * 1024),
            ]);

        DB::transaction(function () use ($content): void {
            SiteContent::query()->delete();
            $content->chunk(250)->each(function ($chunk): void {
                SiteContent::query()->insert(
                    $chunk->map(fn (string $value, string $key): array => compact('key', 'value'))->values()->all(),
                );
            });
        });

        return response()->json(['ok' => true, 'count' => $content->count()]);
    }
}
