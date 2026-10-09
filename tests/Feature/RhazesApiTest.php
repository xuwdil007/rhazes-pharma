<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RhazesApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'rhazes.admin_login' => 'admin',
            'rhazes.admin_password' => 'TestPass123!',
        ]);
    }

    public function test_admin_can_manage_content_and_receive_forms(): void
    {
        $token = $this->postJson('/api/admin/login', [
            'login' => 'admin',
            'password' => 'TestPass123!',
        ])->assertOk()->json('token');

        $headers = ['Authorization' => 'Bearer '.$token];

        $this->withHeaders($headers)->putJson('/api/content', [
            'hero' => 'Новый текст',
        ])->assertOk()->assertJson(['ok' => true, 'count' => 1]);
        $this->getJson('/api/content')->assertOk()->assertJson(['hero' => 'Новый текст']);

        $this->postJson('/api/applications', [
            'id' => 'application-1',
            'submittedAt' => now()->toIso8601String(),
            'name' => 'Кандидат',
            'email' => 'candidate@example.com',
            'phone' => '+992000000000',
            'direction' => 'Производство',
            'about' => 'Опыт работы',
        ])->assertCreated();
        $this->withHeaders($headers)->getJson('/api/applications')
            ->assertOk()->assertJsonPath('0.name', 'Кандидат');

        $this->postJson('/api/messages', [
            'id' => 'message-1',
            'submittedAt' => now()->toIso8601String(),
            'name' => 'Партнёр',
            'email' => 'partner@example.com',
            'subject' => 'Сотрудничество',
            'message' => 'Предложение',
        ])->assertCreated();
        $this->withHeaders($headers)->getJson('/api/messages')
            ->assertOk()->assertJsonPath('0.subject', 'Сотрудничество');
    }

    public function test_changed_credentials_replace_old_login(): void
    {
        $token = $this->postJson('/api/admin/login', [
            'login' => 'admin',
            'password' => 'TestPass123!',
        ])->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/admin/credentials', [
                'login' => 'new-admin',
                'password' => 'NewPass456!',
            ])->assertOk()->assertJsonStructure(['token']);

        $this->postJson('/api/admin/login', [
            'login' => 'admin',
            'password' => 'TestPass123!',
        ])->assertUnauthorized();
        $this->postJson('/api/admin/login', [
            'login' => 'new-admin',
            'password' => 'NewPass456!',
        ])->assertOk();
    }
}
