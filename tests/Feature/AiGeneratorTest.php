<?php

namespace Tests\Feature;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Ai\Services\OpenAiPostGeneratorService;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class AiGeneratorTest extends TestCase
{
    use RefreshDatabase;

    private function fakeOpenAi(array $posts): void
    {
        Http::fake(['api.openai.com/*' => Http::response([
            'choices' => [['message' => ['content' => json_encode(['posts' => $posts])]]],
        ])]);
    }

    public function test_container_resolves_openai_implementation(): void
    {
        $this->assertInstanceOf(OpenAiPostGeneratorService::class, app(AiClientInterface::class));
    }

    public function test_generate_returns_drafts_in_flash(): void
    {
        $this->fakeOpenAi([
            ['title' => 'AI Satu', 'category' => 'Teknologi', 'excerpt' => 'r', 'content' => 'isi'],
            ['title' => 'AI Dua', 'category' => 'Tidak Valid', 'content' => 'isi'],
            ['title' => 'AI Tiga', 'category' => 'Umum', 'content' => 'isi'],
        ]);

        $response = $this->actingAs(User::factory()->create())
            ->post('/dashboard/posts/ai-generate', ['topic' => 'Laravel', 'count' => 2, 'category' => 'Teknologi']);

        $response->assertSessionHas('aiDrafts', fn ($drafts) => count($drafts) === 2 && $drafts[1]['category'] === 'Umum');
        Http::assertSent(fn ($r) => $r->hasHeader('Authorization', 'Bearer test-key') && str_contains($r['messages'][1]['content'], 'Laravel'));
    }

    public function test_generate_validates_count_limits(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/dashboard/posts/ai-generate', ['topic' => 'x', 'count' => 99])->assertSessionHasErrors('count');
    }

    public function test_generate_reports_missing_api_key(): void
    {
        config(['openai.api_key' => null]);

        $this->actingAs(User::factory()->create())
            ->post('/dashboard/posts/ai-generate', ['topic' => 'x', 'count' => 1])
            ->assertSessionHas('error', 'OPENAI_API_KEY belum dikonfigurasi.');
    }

    public function test_generate_reports_http_failure(): void
    {
        Http::fake(['*' => Http::response('boom', 500)]);

        $this->actingAs(User::factory()->create())
            ->post('/dashboard/posts/ai-generate', ['topic' => 'x', 'count' => 1])
            ->assertSessionHas('error', fn ($m) => str_contains($m, '500'));
    }

    public function test_generate_reports_invalid_payload(): void
    {
        Http::fake(['*' => Http::response(['choices' => [['message' => ['content' => 'bukan json']]]])]);

        $this->actingAs(User::factory()->create())
            ->post('/dashboard/posts/ai-generate', ['topic' => 'x', 'count' => 1])
            ->assertSessionHas('error', 'Respons OpenAI tidak berisi artikel yang valid.');
    }

    public function test_service_throws_runtime_exception_directly(): void
    {
        Http::fake(['*' => Http::response(['choices' => [['message' => ['content' => '{"posts":"x"}']]]])]);

        $this->expectException(RuntimeException::class);
        app(AiClientInterface::class)->generatePosts('x', 1);
    }

    public function test_save_stores_drafts(): void
    {
        $user = User::factory()->create();
        $items = [
            (new GeneratedPostItem('AI Satu', 'Bisnis', 'ring', 'isi'))->toArray(),
            (new GeneratedPostItem('AI Dua', 'Umum', null, 'isi'))->toArray(),
        ];

        $this->actingAs($user)->post('/dashboard/posts/ai-save', ['items' => $items])
            ->assertSessionHas('success', '2 artikel AI disimpan sebagai draf.');

        $this->assertSame(2, Post::where('user_id', $user->id)->where('is_published', false)->count());
    }

    public function test_save_validates_items(): void
    {
        $this->actingAs(User::factory()->create())->post('/dashboard/posts/ai-save', ['items' => []])->assertSessionHasErrors('items');
    }
}
