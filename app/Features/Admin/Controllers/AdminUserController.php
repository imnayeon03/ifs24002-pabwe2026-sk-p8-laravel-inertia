<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Services\AdminUserService;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController
{
    public function __construct(private readonly AdminUserService $users) {}

    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();

        return Inertia::render('Admin/UserList', [
            'users' => $this->users->paginate($search),
            'filters' => ['q' => $search],
        ]);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $this->users->delete($user);

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
