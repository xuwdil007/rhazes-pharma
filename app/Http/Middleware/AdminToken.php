<?php

namespace App\Http\Middleware;

use App\Models\AdminSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $session = $token
            ? AdminSession::query()->where('token_hash', hash('sha256', $token))->first()
            : null;

        if (! $session || $session->expires_at->isPast()) {
            $session?->delete();

            return response()->json(['error' => 'Требуется авторизация'], 401);
        }

        return $next($request);
    }
}
