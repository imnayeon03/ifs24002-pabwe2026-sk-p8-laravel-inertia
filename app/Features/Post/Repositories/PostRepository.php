<?php

namespace App\Features\Post\Repositories;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PostRepository implements PostRepositoryInterface
{
    private const AUTHOR_PUBLIC = 'user:id,name,username,profile_photo_path';

    public function paginatePublished(string $search, string $category, int $perPage = 9): LengthAwarePaginator
    {
        $query = Post::query()
            ->with(self::AUTHOR_PUBLIC)
            ->where('is_published', true)
            ->when($category !== '', fn (Builder $q) => $q->where('category', $category))
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        return $this->search($query, $search)->paginate($perPage)->withQueryString();
    }

    public function findPublishedBySlug(string $slug): ?Post
    {
        return Post::query()->with(self::AUTHOR_PUBLIC)
            ->where('is_published', true)->where('slug', $slug)->first();
    }

    public function latestPublished(int $limit, ?int $exceptId = null): Collection
    {
        return Post::query()->with(self::AUTHOR_PUBLIC)
            ->where('is_published', true)
            ->when($exceptId !== null, fn (Builder $q) => $q->where('id', '!=', $exceptId))
            ->orderByDesc('published_at')->limit($limit)->get();
    }

    public function paginateForUser(User $user, string $search, string $status, int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->filterStatus(Post::query()->where('user_id', $user->id), $status)
            ->orderByDesc('updated_at')->orderByDesc('id');

        return $this->search($query, $search)->paginate($perPage)->withQueryString();
    }

    public function paginateAll(string $search, string $status, ?int $userId = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = Post::query()->with('user:id,name,username')
            ->when($userId !== null, fn (Builder $q) => $q->where('user_id', $userId));
        $query = $this->filterStatus($query, $status)->orderByDesc('updated_at')->orderByDesc('id');

        return $this->search($query, $search)->paginate($perPage)->withQueryString();
    }

    public function getAll(?int $userId = null): Collection
    {
        return Post::query()->with('user:id,name,username')
            ->when($userId !== null, fn (Builder $q) => $q->where('user_id', $userId))
            ->orderBy('id')->get();
    }

    public function stats(?int $userId = null): array
    {
        $base = fn () => Post::query()->when($userId !== null, fn (Builder $q) => $q->where('user_id', $userId));

        $total = $base()->count();
        $published = $base()->where('is_published', true)->count();

        return ['total' => $total, 'published' => $published, 'draft' => $total - $published];
    }

    public function create(array $attributes): Post
    {
        return Post::create($attributes);
    }

    public function update(Post $post, array $attributes): Post
    {
        $post->update($attributes);

        return $post->refresh();
    }

    public function delete(Post $post): void
    {
        $post->delete();
    }

    public function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        return Post::query()->where('slug', $slug)
            ->when($ignoreId !== null, fn (Builder $q) => $q->where('id', '!=', $ignoreId))->exists();
    }

    private function filterStatus(Builder $query, string $status): Builder
    {
        return match ($status) {
            'published' => $query->where('is_published', true),
            'draft' => $query->where('is_published', false),
            default => $query,
        };
    }

    /** Pencarian judul/ringkasan/isi, portabel untuk PostgreSQL & SQLite. */
    private function search(Builder $query, string $search): Builder
    {
        $search = trim($search);
        if ($search === '') {
            return $query;
        }
        $term = '%'.mb_strtolower($search).'%';

        return $query->where(fn (Builder $w) => $w
            ->whereRaw('LOWER(title) LIKE ?', [$term])
            ->orWhereRaw('LOWER(excerpt) LIKE ?', [$term])
            ->orWhereRaw('LOWER(content) LIKE ?', [$term]));
    }
}
