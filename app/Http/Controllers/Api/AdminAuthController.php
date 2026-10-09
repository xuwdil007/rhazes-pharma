<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminCredential;
use App\Models\AdminSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'login' => ['required', 'string', 'max:80'],
            'password' => ['required', 'string', 'max:256'],
        ]);
        $credentials = AdminCredential::query()->find(1);
        $expectedLogin = $credentials?->login ?? config('rhazes.admin_login');
        $validPassword = $credentials
            ? $this->passwordMatches($data['password'], $credentials)
            : hash_equals((string) config('rhazes.admin_password'), $data['password']);

        if (! hash_equals($expectedLogin, $data['login']) || ! $validPassword) {
            return response()->json(['error' => 'Неверный логин или пароль'], 401);
        }

        return response()->json(['token' => $this->createToken()]);
    }

    public function credentials(): JsonResponse
    {
        return response()->json([
            'login' => AdminCredential::query()->find(1)?->login ?? config('rhazes.admin_login'),
        ]);
    }

    public function updateCredentials(Request $request): JsonResponse
    {
        $data = $request->validate([
            'login' => ['required', 'string', 'min:3', 'max:80'],
            'password' => ['required', 'string', 'min:8', 'max:256'],
        ]);

        $token = DB::transaction(function () use ($data): string {
            AdminCredential::query()->updateOrCreate(['id' => 1], [
                'login' => trim($data['login']),
                'password_salt' => '',
                'password_hash' => Hash::make($data['password']),
            ]);
            AdminSession::query()->delete();

            return $this->createToken();
        });

        return response()->json(['token' => $token]);
    }

    private function createToken(): string
    {
        $plain = Str::random(80);
        AdminSession::query()->create([
            'token_hash' => hash('sha256', $plain),
            'expires_at' => now()->addHours(8),
        ]);

        return $plain;
    }

    private function passwordMatches(string $password, AdminCredential $credentials): bool
    {
        if (str_starts_with($credentials->password_hash, '$')) {
            return Hash::check($password, $credentials->password_hash);
        }
        $sum = hash('sha256', $credentials->password_salt.$password, true);
        for ($i = 0; $i < 120000; $i++) {
            $next = hash('sha256', $sum.$credentials->password_salt, true);
            $sum = hash('sha256', $next, true);
        }

        return hash_equals($credentials->password_hash, bin2hex($sum));
    }
}
