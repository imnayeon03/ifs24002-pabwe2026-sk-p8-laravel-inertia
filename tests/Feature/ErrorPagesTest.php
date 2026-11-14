<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_url_renders_branded_404_page(): void
    {
        $this->get('/halaman-tidak-ada')->assertNotFound()
            ->assertInertia(fn (Assert $p) => $p->component('Error')->where('status', 404));
    }

    public function test_forbidden_renders_branded_403_page(): void
    {
        $this->actingAs(User::factory()->create())->get('/admin/users')->assertForbidden()
            ->assertInertia(fn (Assert $p) => $p->component('Error')->where('status', 403));
    }

    public function test_other_http_errors_keep_default_response(): void
    {
        $this->post('/articles')->assertStatus(405);
    }
}
