<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_and_register_pages_render_for_guests(): void
    {
        $this->get('/login')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Auth/Login'));
        $this->get('/register')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Auth/Register'));
    }

    public function test_member_can_login_and_is_sent_to_dashboard(): void
    {
        $user = User::factory()->create(['username' => 'budi']);

        $this->post('/login', ['username' => 'budi', 'password' => 'password'])
            ->assertRedirect('/dashboard/posts');
        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_is_sent_to_admin_panel(): void
    {
        User::factory()->admin()->create(['username' => 'boss']);

        $this->post('/login', ['username' => 'boss', 'password' => 'password'])
            ->assertRedirect('/admin/users');
    }

    public function test_login_fails_with_wrong_credentials(): void
    {
        User::factory()->create(['username' => 'budi']);

        $this->from('/login')->post('/login', ['username' => 'budi', 'password' => 'salah'])
            ->assertRedirect('/login')->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_login_requires_fields(): void
    {
        $this->post('/login', [])->assertSessionHasErrors(['username', 'password']);
    }

    public function test_register_creates_member_and_logs_in(): void
    {
        $this->post('/register', [
            'name' => 'Siti', 'username' => 'siti_01', 'password' => 'rahasia123', 'password_confirmation' => 'rahasia123',
        ])->assertRedirect('/dashboard/posts');

        $user = User::where('username', 'siti_01')->firstOrFail();
        $this->assertSame('member', $user->role);
        $this->assertAuthenticatedAs($user);
    }

    public function test_register_validates_input(): void
    {
        User::factory()->create(['username' => 'dipakai']);

        $this->post('/register', [
            'name' => 'X', 'username' => 'dipakai', 'password' => 'pendek', 'password_confirmation' => 'beda',
        ])->assertSessionHasErrors(['username', 'password']);
    }

    public function test_logout_ends_session(): void
    {
        $this->actingAs(User::factory()->create())->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_guest_is_redirected_to_login_and_authenticated_user_away_from_login(): void
    {
        $this->get('/dashboard/posts')->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->get('/login')->assertRedirect('/dashboard/posts');
    }

    public function test_dashboard_alias_redirects_to_posts(): void
    {
        $this->actingAs(User::factory()->create())->get('/dashboard')->assertRedirect('/dashboard/posts');
    }

    public function test_shared_props_expose_user_and_flash(): void
    {
        $user = User::factory()->create(['name' => 'Ani']);

        $this->actingAs($user)->withSession(['success' => 'ok', 'error' => 'gagal'])->get('/dashboard/posts')
            ->assertInertia(fn (Assert $p) => $p
                ->where('auth.user.name', 'Ani')
                ->where('flash.success', 'ok')
                ->where('flash.error', 'gagal'));

        $this->post('/logout');
        $this->get('/')->assertInertia(fn (Assert $p) => $p->where('auth.user', null));
    }
}
