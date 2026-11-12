<?php

namespace App\Features\Admin\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;

class AdminUserService
{
    public function paginate(string $search, int $perPage = 10): LengthAwarePaginator
    {
        $search = mb_strtolower(trim($search));

        return User::query()->withCount('posts')
            ->when($search !== '', fn (Builder $q) => $q->where(fn (Builder $w) => $w
                ->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                ->orWhereRaw('LOWER(username) LIKE ?', ["%{$search}%"])))
            ->orderBy('name')->paginate($perPage)->withQueryString();
    }

    /** Menghapus pengguna beserta berkas cover artikel & foto profilnya. */
    public function delete(User $user): void
    {
        $paths = $user->posts()->whereNotNull('cover_image_path')->pluck('cover_image_path')->all();
        if ($user->profile_photo_path) {
            $paths[] = $user->profile_photo_path;
        }
        Storage::disk('public')->delete($paths);

        $user->delete();
    }
}
