<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /** Menjamin akun demo ada walau platform deploy hanya menjalankan `migrate` (tanpa --seed). */
    public function up(): void
    {
        if (app()->environment('testing')) {
            return;
        }

        User::updateOrCreate(['username' => 'admin'], [
            'name' => 'Administrator', 'role' => User::ROLE_ADMIN, 'password' => 'admin',
        ]);
        User::updateOrCreate(['username' => 'member'], [
            'name' => 'Penulis Demo', 'role' => User::ROLE_MEMBER, 'password' => 'member',
        ]);
    }

    public function down(): void
    {
        User::whereIn('username', ['admin', 'member'])->delete();
    }
};
