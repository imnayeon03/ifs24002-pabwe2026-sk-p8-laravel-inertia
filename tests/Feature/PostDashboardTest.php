<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PostDashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->user = User::factory()->create();
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'title' => 'Judul Baru', 'category' => 'Teknologi', 'excerpt' => 'Ringkas',
            'content' => '## Halo', 'is_published' => true,
        ], $override);
    }

    public function test_index_lists_own_posts_with_stats_and_filters(): void
    {
        Post::factory()->count(2)->for($this->user)->create();
        Post::factory()->draft()->for($this->user)->create(['title' => 'Draf Saya']);
        Post::factory()->create(); // milik orang lain

        $this->actingAs($this->user)->get('/dashboard/posts')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Post/Index')
            ->has('posts.data', 3)
            ->where('stats', ['total' => 3, 'published' => 2, 'draft' => 1]));

        $this->actingAs($this->user)->get('/dashboard/posts?status=draft')->assertInertia(fn (Assert $p) => $p->has('posts.data', 1));
        $this->actingAs($this->user)->get('/dashboard/posts?status=published')->assertInertia(fn (Assert $p) => $p->has('posts.data', 2));
        $this->actingAs($this->user)->get('/dashboard/posts?q=draf saya')->assertInertia(fn (Assert $p) => $p->has('posts.data', 1));
    }

    public function test_store_creates_published_post_with_cover_and_unique_slug(): void
    {
        $this->actingAs($this->user)->post('/dashboard/posts', $this->payload([
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
        ]))->assertRedirect()->assertSessionHas('success');

        $post = Post::firstOrFail();
        $this->assertSame('judul-baru', $post->slug);
        $this->assertTrue($post->is_published);
        $this->assertNotNull($post->published_at);
        Storage::disk('public')->assertExists($post->cover_image_path);

        $this->actingAs($this->user)->post('/dashboard/posts', $this->payload(['is_published' => false]));
        $second = Post::where('is_published', false)->firstOrFail();
        $this->assertSame('judul-baru-2', $second->slug);
        $this->assertNull($second->published_at);
    }

    public function test_store_with_symbol_only_title_falls_back_to_default_slug(): void
    {
        $this->actingAs($this->user)->post('/dashboard/posts', $this->payload(['title' => '!!!']));

        $this->assertSame('artikel', Post::firstOrFail()->slug);
    }

    public function test_store_validates(): void
    {
        $this->actingAs($this->user)->post('/dashboard/posts', ['category' => 'Salah'])
            ->assertSessionHasErrors(['title', 'category', 'content']);
    }

    public function test_show_displays_own_post(): void
    {
        $post = Post::factory()->for($this->user)->create();

        $this->actingAs($this->user)->get("/dashboard/posts/{$post->id}")
            ->assertInertia(fn (Assert $p) => $p->component('Post/Show')->where('post.id', $post->id));
    }

    public function test_update_changes_slug_only_when_title_changes_and_replaces_cover(): void
    {
        $post = Post::factory()->for($this->user)->create(['title' => 'Lama', 'slug' => 'lama']);
        $this->actingAs($this->user);

        $this->put("/dashboard/posts/{$post->id}", $this->payload(['title' => 'Lama', 'is_published' => false]))->assertRedirect();
        $post->refresh();
        $this->assertSame('lama', $post->slug);
        $this->assertFalse($post->is_published);
        $this->assertNull($post->published_at);

        $this->put("/dashboard/posts/{$post->id}", $this->payload(['title' => 'Judul Segar', 'cover_image' => UploadedFile::fake()->image('a.jpg')]));
        $post->refresh();
        $this->assertSame('judul-segar', $post->slug);
        $this->assertTrue($post->is_published);
        $old = $post->cover_image_path;
        Storage::disk('public')->assertExists($old);

        $this->put("/dashboard/posts/{$post->id}", $this->payload(['title' => 'Judul Segar', 'cover_image' => UploadedFile::fake()->image('b.jpg')]));
        Storage::disk('public')->assertMissing($old);
    }

    public function test_update_keeps_original_publish_date(): void
    {
        $date = now()->subDays(5)->startOfSecond();
        $post = Post::factory()->for($this->user)->create(['published_at' => $date]);

        $this->actingAs($this->user)->put("/dashboard/posts/{$post->id}", $this->payload(['title' => $post->title]));

        $this->assertTrue($post->refresh()->published_at->equalTo($date));
    }

    public function test_destroy_deletes_post_and_cover(): void
    {
        $this->actingAs($this->user)->post('/dashboard/posts', $this->payload(['cover_image' => UploadedFile::fake()->image('c.jpg')]));
        $post = Post::firstOrFail();
        $path = $post->cover_image_path;

        $this->delete("/dashboard/posts/{$post->id}")->assertRedirect('/dashboard/posts');

        $this->assertModelMissing($post);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_publish_toggles_status(): void
    {
        $post = Post::factory()->draft()->for($this->user)->create();
        $this->actingAs($this->user);

        $this->patch("/dashboard/posts/{$post->id}/publish")->assertSessionHas('success', 'Artikel dipublikasikan.');
        $this->assertTrue($post->refresh()->is_published);

        $this->patch("/dashboard/posts/{$post->id}/publish")->assertSessionHas('success', 'Artikel dijadikan draf.');
        $this->assertFalse($post->refresh()->is_published);
    }

    public function test_cover_upload_and_removal(): void
    {
        $post = Post::factory()->for($this->user)->create();
        $this->actingAs($this->user);

        $this->post("/dashboard/posts/{$post->id}/cover", [])->assertSessionHasErrors('cover_image');

        $this->post("/dashboard/posts/{$post->id}/cover", ['cover_image' => UploadedFile::fake()->image('x.png')])->assertSessionHas('success');
        $path = $post->refresh()->cover_image_path;
        Storage::disk('public')->assertExists($path);
        $this->assertStringContainsString($path, $post->cover_image_url);

        $this->delete("/dashboard/posts/{$post->id}/cover")->assertSessionHas('success');
        $this->assertNull($post->refresh()->cover_image_path);
        $this->assertNull($post->cover_image_url);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_other_users_posts_are_forbidden(): void
    {
        $foreign = Post::factory()->create();
        $this->actingAs($this->user);

        $this->get("/dashboard/posts/{$foreign->id}")->assertForbidden();
        $this->put("/dashboard/posts/{$foreign->id}", $this->payload())->assertForbidden();
        $this->delete("/dashboard/posts/{$foreign->id}")->assertForbidden();
        $this->patch("/dashboard/posts/{$foreign->id}/publish")->assertForbidden();
        $this->assertModelExists($foreign);
    }

    public function test_unknown_post_is_404(): void
    {
        $this->actingAs($this->user)->get('/dashboard/posts/9999')->assertNotFound();
    }

    public function test_guest_cannot_access_dashboard_routes(): void
    {
        $this->post('/dashboard/posts', $this->payload())->assertRedirect('/login');
        $this->get('/dashboard/posts/export')->assertRedirect('/login');
    }
}
