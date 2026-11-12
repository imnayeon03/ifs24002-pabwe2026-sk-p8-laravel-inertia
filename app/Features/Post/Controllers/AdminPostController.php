<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminPostController
{
    public function __construct(private readonly PostService $posts) {}

    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();
        $status = $request->string('status')->toString();

        return Inertia::render('Admin/PostList', [
            'posts' => $this->posts->adminIndex($search, $status),
            'stats' => $this->posts->stats(),
            'filters' => ['q' => $search, 'status' => $status],
        ]);
    }

    public function userPosts(Request $request, User $user): Response
    {
        $search = $request->string('q')->trim()->toString();
        $status = $request->string('status')->toString();

        return Inertia::render('Admin/UserPostList', [
            'author' => $user->only(['id', 'name', 'username']),
            'posts' => $this->posts->adminIndex($search, $status, $user->id),
            'stats' => $this->posts->stats($user->id),
            'filters' => ['q' => $search, 'status' => $status],
        ]);
    }

    public function export(PostExcelService $excel): BinaryFileResponse
    {
        $path = $excel->export($this->posts->all(), withAuthor: true);

        return response()->download($path, 'semua-artikel.xlsx')->deleteFileAfterSend(true);
    }

    public function exportUser(PostExcelService $excel, User $user): BinaryFileResponse
    {
        $path = $excel->export($this->posts->all($user->id), withAuthor: true);

        return response()->download($path, "artikel-{$user->username}.xlsx")->deleteFileAfterSend(true);
    }
}
