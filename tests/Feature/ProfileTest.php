<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_edit_page_renders(): void
    {
        $this->actingAs(User::factory()->create())->get('/profile')
            ->assertInertia(fn (Assert $p) => $p->component('Profile/Edit'));
    }

    public function test_update_name_username_password_and_photo(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->put('/profile', [
            'name' => 'Nama Baru', 'username' => 'baru_01', 'password' => 'passwordbaru', 'password_confirmation' => 'passwordbaru',
            'photo' => UploadedFile::fake()->image('me.jpg'),
        ])->assertSessionHas('success');

        $user->refresh();
        $this->assertSame('Nama Baru', $user->name);
        $this->assertSame('baru_01', $user->username);
        $this->assertTrue(Hash::check('passwordbaru', $user->password));
        Storage::disk('public')->assertExists($user->profile_photo_path);
        $this->assertNotNull($user->profile_photo_url);

        $old = $user->profile_photo_path;
        $this->put('/profile', ['name' => 'Nama Baru', 'username' => 'baru_01', 'photo' => UploadedFile::fake()->image('new.jpg')]);
        Storage::disk('public')->assertMissing($old);
        $this->assertTrue(Hash::check('passwordbaru', $user->refresh()->password)); // password tidak berubah
    }

    public function test_username_must_be_unique_except_own(): void
    {
        User::factory()->create(['username' => 'dipakai']);
        $user = User::factory()->create(['username' => 'saya']);
        $this->actingAs($user);

        $this->put('/profile', ['name' => 'X', 'username' => 'dipakai'])->assertSessionHasErrors('username');
        $this->put('/profile', ['name' => 'X', 'username' => 'saya'])->assertSessionHasNoErrors();
    }
}
