<?php

namespace App\Features\Post\Services;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostService
{
    public function __construct(private readonly PostRepositoryInterface $posts) {}

    // ---- Publik ----------------------------------------------------------

    public function publicIndex(string $search, string $category): LengthAwarePaginator
    {
        return $this->posts->paginatePublished($search, $category);
    }

    public function publicShow(string $slug): Post
    {
        return $this->posts->findPublishedBySlug($slug) ?? abort(404);
    }

    public function related(Post $post): Collection
    {
        return $this->posts->latestPublished(3, $post->id);
    }

    // ---- Penulis & admin -------------------------------------------------

    public function dashboardIndex(User $user, string $search, string $status): LengthAwarePaginator
    {
        return $this->posts->paginateForUser($user, $search, $status);
    }

    public function adminIndex(string $search, string $status, ?int $userId = null): LengthAwarePaginator
    {
        return $this->posts->paginateAll($search, $status, $userId);
    }

    public function stats(?int $userId = null): array
    {
        return $this->posts->stats($userId);
    }

    public function all(?int $userId = null): Collection
    {
        return $this->posts->getAll($userId);
    }

    public function create(User $user, array $data, ?UploadedFile $cover = null): Post
    {
        $post = $this->posts->create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'slug' => $this->uniqueSlug($data['title']),
            'category' => $data['category'] ?? 'Umum',
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            ...$this->publication((bool) ($data['is_published'] ?? false)),
        ]);

        return $cover ? $this->setCover($post, $cover) : $post;
    }

    public function update(Post $post, array $data, ?UploadedFile $cover = null): Post
    {
        $attributes = [
            'title' => $data['title'],
            'category' => $data['category'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            ...$this->publication((bool) ($data['is_published'] ?? false), $post),
        ];
        if ($post->title !== $data['title']) {
            $attributes['slug'] = $this->uniqueSlug($data['title'], $post->id);
        }

        $post = $this->posts->update($post, $attributes);

        return $cover ? $this->setCover($post, $cover) : $post;
    }

    public function delete(Post $post): void
    {
        $this->deleteFile($post->cover_image_path);
        $this->posts->delete($post);
    }

    public function togglePublish(Post $post): Post
    {
        return $this->posts->update($post, $this->publication(! $post->is_published, $post));
    }

    public function setCover(Post $post, UploadedFile $file): Post
    {
        $this->deleteFile($post->cover_image_path);

        return $this->posts->update($post, ['cover_image_path' => $file->store('covers', 'public')]);
    }

    public function removeCover(Post $post): Post
    {
        $this->deleteFile($post->cover_image_path);

        return $this->posts->update($post, ['cover_image_path' => null]);
    }

    /** Menyimpan batch artikel (hasil AI) sebagai draf. */
    public function createMany(User $user, array $items): int
    {
        foreach ($items as $item) {
            $this->create($user, [...$item, 'is_published' => false]);
        }

        return count($items);
    }

    public function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'artikel';
        $slug = $base;
        $i = 2;
        while ($this->posts->slugExists($slug, $ignoreId)) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    private function publication(bool $publish, ?Post $existing = null): array
    {
        if (! $publish) {
            return ['is_published' => false, 'published_at' => null];
        }

        return ['is_published' => true, 'published_at' => $existing?->published_at ?? now()];
    }

    private function deleteFile(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
