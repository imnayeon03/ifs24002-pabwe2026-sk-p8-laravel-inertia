<?php

namespace Database\Seeders;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Akun demo: admin / admin dan member / member. */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrator', 'username' => 'admin', 'role' => User::ROLE_ADMIN, 'password' => 'admin',
        ]);
        $member = User::create([
            'name' => 'Penulis Demo', 'username' => 'member', 'role' => User::ROLE_MEMBER, 'password' => 'member',
        ]);

        Post::factory()->count(6)->for($member)->create();
        Post::factory()->count(2)->draft()->for($member)->create();
        Post::factory()->count(3)->for($admin)->create();
    }
}
