<?php

namespace App\Features\Ai\Contracts;

use App\Features\Ai\DTO\GeneratedPostItem;
use RuntimeException;

interface AiClientInterface
{
    /**
     * @return list<GeneratedPostItem>
     *
     * @throws RuntimeException bila layanan AI gagal / belum dikonfigurasi
     */
    public function generatePosts(string $topic, int $count, ?string $category = null): array;
}
