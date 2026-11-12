<?php

namespace App\Features\Post\Contracts;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PostRepositoryInterface
{
    public function paginatePublished(string $search, string $category, int $perPage = 9): LengthAwarePaginator;

    public function findPublishedBySlug(string $slug): ?Post;

    public function latestPublished(int $limit, ?int $exceptId = null): Collection;

    public function paginateForUser(User $user, string $search, string $status, int $perPage = 10): LengthAwarePaginator;

    /** Pemantauan admin: seluruh artikel, bisa difilter per penulis. */
    public function paginateAll(string $search, string $status, ?int $userId = null, int $perPage = 10): LengthAwarePaginator;

    /** @return Collection<int, Post> */
    public function getAll(?int $userId = null): Collection;

    /** @return array{total: int, published: int, draft: int} */
    public function stats(?int $userId = null): array;

    public function create(array $attributes): Post;

    public function update(Post $post, array $attributes): Post;

    public function delete(Post $post): void;

    public function slugExists(string $slug, ?int $ignoreId = null): bool;
}
