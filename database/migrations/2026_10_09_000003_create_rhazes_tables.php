<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('content')) {
            Schema::create('content', function (Blueprint $table): void {
                $table->string('key')->primary();
                $table->text('value');
            });
        }
        if (! Schema::hasTable('applications')) {
            Schema::create('applications', function (Blueprint $table): void {
                $table->string('id')->primary();
                $table->string('submitted_at', 60);
                $table->string('name', 180);
                $table->string('email', 240);
                $table->string('phone', 80);
                $table->string('direction', 180);
                $table->text('about');
            });
        }
        if (! Schema::hasTable('messages')) {
            Schema::create('messages', function (Blueprint $table): void {
                $table->string('id')->primary();
                $table->string('submitted_at', 60);
                $table->string('name', 180);
                $table->string('email', 240);
                $table->string('subject', 180);
                $table->text('message');
            });
        }
        if (! Schema::hasTable('admin_credentials')) {
            Schema::create('admin_credentials', function (Blueprint $table): void {
                $table->unsignedTinyInteger('id')->primary();
                $table->string('login', 80);
                $table->string('password_salt')->default('');
                $table->string('password_hash');
            });
        }
        if (! Schema::hasTable('admin_sessions')) {
            Schema::create('admin_sessions', function (Blueprint $table): void {
                $table->id();
                $table->string('token_hash', 64)->unique();
                $table->timestamp('expires_at')->index();
            });
        }
        if (! Schema::hasTable('app_meta')) {
            Schema::create('app_meta', function (Blueprint $table): void {
                $table->string('key')->primary();
                $table->string('value');
            });
        }

        $this->importLegacyJsonOnce();
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_sessions');
    }

    private function importLegacyJsonOnce(): void
    {
        if (DB::table('app_meta')->where('key', 'legacy_json_migrated')->exists()) {
            return;
        }

        $dataPath = base_path('backend/data');
        $content = $this->readJson($dataPath.'/content.json', []);
        foreach ($content as $key => $value) {
            if (is_string($key) && is_string($value)) {
                DB::table('content')->updateOrInsert(['key' => $key], ['value' => $value]);
            }
        }
        foreach ($this->readJson($dataPath.'/applications.json', []) as $item) {
            if (! empty($item['id'])) {
                DB::table('applications')->updateOrInsert(['id' => $item['id']], [
                    'submitted_at' => $item['submittedAt'] ?? '',
                    'name' => $item['name'] ?? '', 'email' => $item['email'] ?? '',
                    'phone' => $item['phone'] ?? '', 'direction' => $item['direction'] ?? '',
                    'about' => $item['about'] ?? '',
                ]);
            }
        }
        foreach ($this->readJson($dataPath.'/messages.json', []) as $item) {
            if (! empty($item['id'])) {
                DB::table('messages')->updateOrInsert(['id' => $item['id']], [
                    'submitted_at' => $item['submittedAt'] ?? '',
                    'name' => $item['name'] ?? '', 'email' => $item['email'] ?? '',
                    'subject' => $item['subject'] ?? '', 'message' => $item['message'] ?? '',
                ]);
            }
        }
        $credentials = $this->readJson($dataPath.'/credentials.json', []);
        if (! empty($credentials['login']) && ! empty($credentials['passwordHash'])) {
            DB::table('admin_credentials')->updateOrInsert(['id' => 1], [
                'login' => $credentials['login'],
                'password_salt' => $credentials['passwordSalt'] ?? '',
                'password_hash' => $credentials['passwordHash'],
            ]);
        }
        DB::table('app_meta')->insert(['key' => 'legacy_json_migrated', 'value' => '1']);
    }

    private function readJson(string $path, array $fallback): array
    {
        if (! is_file($path)) {
            return $fallback;
        }
        $decoded = json_decode((string) file_get_contents($path), true);

        return is_array($decoded) ? $decoded : $fallback;
    }
};
