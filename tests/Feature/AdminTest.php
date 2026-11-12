<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->admin = User::factory()->admin()->create(['name' => 'Admin Utama']);
    }

    public function test_members_cannot_access_admin_area(): void
    {
        $member = User::factory()->create();

        foreach (['/admin/users', '/admin/posts', '/admin/posts/export', "/admin/users/{$member->id}/posts"] as $url) {
            $this->actingAs($member)->get($url)->assertForbidden();
        }
        $this->actingAs($member)->delete("/admin/users/{$member->id}")->assertForbidden();
    }

    public function test_user_list_with_search_and_post_counts(): void
    {
        $budi = User::factory()->create(['name' => 'Budi Santoso', 'username' => 'budi']);
        User::factory()->create(['name' => 'Citra', 'username' => 'citra']);
        Post::factory()->count(2)->for($budi)->create();

        $this->actingAs($this->admin)->get('/admin/users')->assertInertia(fn (Assert $p) => $p
            ->component('Admin/UserList')->has('users.data', 3));

        $this->actingAs($this->admin)->get('/admin/users?q=BUDI')->assertInertia(fn (Assert $p) => $p
            ->has('users.data', 1)->where('users.data.0.posts_count', 2));
        $this->actingAs($this->admin)->get('/admin/users?q=citra')->assertInertia(fn (Assert $p) => $p->has('users.data', 1));
    }

    public function test_admin_deletes_user_with_files_but_not_self(): void
    {
        Storage::disk('public')->put('covers/a.jpg', 'x');
        Storage::disk('public')->put('profiles/p.jpg', 'x');
        $target = User::factory()->create(['profile_photo_path' => 'profiles/p.jpg']);
        Post::factory()->for($target)->create(['cover_image_path' => 'covers/a.jpg']);

        $this->actingAs($this->admin)->delete("/admin/users/{$target->id}")->assertSessionHas('success');

        $this->assertModelMissing($target);
        $this->assertSame(0, Post::count());
        Storage::disk('public')->assertMissing(['covers/a.jpg', 'profiles/p.jpg']);

        $this->actingAs($this->admin)->delete("/admin/users/{$this->admin->id}")->assertSessionHas('error');
        $this->assertModelExists($this->admin);
    }

    public function test_admin_deletes_user_without_files(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->admin)->delete("/admin/users/{$target->id}")->assertSessionHas('success');
        $this->assertModelMissing($target);
    }

    public function test_all_posts_monitoring_includes_drafts_and_filters(): void
    {
        Post::factory()->count(2)->create();
        Post::factory()->draft()->create(['title' => 'Draf Orang']);

        $this->actingAs($this->admin)->get('/admin/posts')->assertInertia(fn (Assert $p) => $p
            ->component('Admin/PostList')->has('posts.data', 3)->where('stats.total', 3)->where('stats.draft', 1));
        $this->actingAs($this->admin)->get('/admin/posts?status=draft&q=orang')->assertInertia(fn (Assert $p) => $p->has('posts.data', 1));
    }

    public function test_user_posts_monitoring_and_exports(): void
    {
        $writer = User::factory()->create(['username' => 'penulis']);
        Post::factory()->count(2)->for($writer)->create();
        Post::factory()->create();

        $this->actingAs($this->admin)->get("/admin/users/{$writer->id}/posts")->assertInertia(fn (Assert $p) => $p
            ->component('Admin/UserPostList')->where('author.username', 'penulis')->has('posts.data', 2)->where('stats.total', 2));

        $this->actingAs($this->admin)->get("/admin/users/{$writer->id}/posts/export")->assertOk()->assertDownload('artikel-penulis.xlsx');
        $this->actingAs($this->admin)->get('/admin/posts/export')->assertOk()->assertDownload('semua-artikel.xlsx');
    }
}
