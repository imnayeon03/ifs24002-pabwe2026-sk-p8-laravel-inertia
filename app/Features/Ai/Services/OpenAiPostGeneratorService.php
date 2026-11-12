<?php

namespace App\Features\Ai\Services;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Enums\PostCategory;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAiPostGeneratorService implements AiClientInterface
{
    public function generatePosts(string $topic, int $count, ?string $category = null): array
    {
        $apiKey = config('openai.api_key');
        if (empty($apiKey)) {
            throw new RuntimeException('OPENAI_API_KEY belum dikonfigurasi.');
        }

        $categories = implode(', ', PostCategory::values());
        $hint = $category ? " dengan kategori \"{$category}\"" : '';

        $response = Http::withToken($apiKey)
            ->baseUrl(rtrim((string) config('openai.base_url'), '/'))
            ->timeout((int) config('openai.timeout'))
            ->post('/chat/completions', [
                'model' => config('openai.model'),
                'temperature' => 0.8,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => 'Anda penulis blog profesional berbahasa Indonesia. Balas HANYA dengan JSON valid.'],
                    ['role' => 'user', 'content' => "Buat {$count} artikel blog bertopik \"{$topic}\"{$hint}. "
                        .'Format: {"posts":[{"title":"...","category":"salah satu dari: '.$categories.'",'
                        .'"excerpt":"ringkasan 1-2 kalimat","content":"isi artikel Markdown, minimal 3 paragraf dengan subjudul"}]}'],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Gagal menghubungi layanan OpenAI (HTTP '.$response->status().').');
        }

        $decoded = json_decode((string) $response->json('choices.0.message.content'), true);
        $posts = is_array($decoded) ? ($decoded['posts'] ?? []) : [];
        if (! is_array($posts) || $posts === []) {
            throw new RuntimeException('Respons OpenAI tidak berisi artikel yang valid.');
        }

        return array_map(
            fn ($item) => GeneratedPostItem::fromArray((array) $item),
            array_slice(array_values($posts), 0, $count)
        );
    }
}
