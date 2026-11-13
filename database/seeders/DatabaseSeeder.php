<?php

namespace Database\Seeders;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Akun demo: admin / admin dan member / member. Aman dijalankan berulang. */
    public function run(): void
    {
        $admin = User::updateOrCreate(['username' => 'admin'], [
            'name' => 'Administrator', 'role' => User::ROLE_ADMIN, 'password' => 'admin',
        ]);
        $member = User::updateOrCreate(['username' => 'member'], [
            'name' => 'Penulis Demo', 'role' => User::ROLE_MEMBER, 'password' => 'member',
        ]);

        if (Post::count() === 0 && class_exists(\Faker\Factory::class)) {
            Post::factory()->count(6)->for($member)->create();
            Post::factory()->count(2)->draft()->for($member)->create();
            Post::factory()->count(3)->for($admin)->create();
        }
    }
}
