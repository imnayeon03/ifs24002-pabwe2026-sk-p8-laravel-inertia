<?php

namespace App\Features\Post\Controllers;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Requests\PostRequest;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class PostController
{
    public function __construct(private readonly PostService $posts) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->string('q')->trim()->toString();
        $status = $request->string('status')->toString();

        return Inertia::render('Post/Index', [
            'posts' => $this->posts->dashboardIndex($user, $search, $status),
            'stats' => $this->posts->stats($user->id),
            'categories' => PostCategory::options(),
            'filters' => ['q' => $search, 'status' => $status],
        ]);
    }

    public function store(PostRequest $request): RedirectResponse
    {
        $this->posts->create($request->user(), $request->validated(), $request->file('cover_image'));

        return back()->with('success', 'Artikel berhasil ditambahkan.');
    }

    public function show(Post $post): Response
    {
        return Inertia::render('Post/Show', ['post' => $post]);
    }

    public function update(PostRequest $request, Post $post): RedirectResponse
    {
        $this->posts->update($post, $request->validated(), $request->file('cover_image'));

        return back()->with('success', 'Artikel berhasil diperbarui.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        $this->posts->delete($post);

        return redirect()->route('dashboard.posts.index')->with('success', 'Artikel berhasil dihapus.');
    }

    public function publish(Post $post): RedirectResponse
    {
        $post = $this->posts->togglePublish($post);

        return back()->with('success', $post->is_published ? 'Artikel dipublikasikan.' : 'Artikel dijadikan draf.');
    }

    public function uploadCover(Request $request, Post $post): RedirectResponse
    {
        $request->validate(['cover_image' => ['required', 'image', 'max:2048']]);
        $this->posts->setCover($post, $request->file('cover_image'));

        return back()->with('success', 'Foto sampul diperbarui.');
    }

    public function removeCover(Post $post): RedirectResponse
    {
        $this->posts->removeCover($post);

        return back()->with('success', 'Foto sampul dihapus.');
    }

    public function export(Request $request, PostExcelService $excel): BinaryFileResponse
    {
        $user = $request->user();
        $path = $excel->export($this->posts->all($user->id));

        return response()->download($path, "artikel-{$user->username}.xlsx")->deleteFileAfterSend(true);
    }

    public function import(Request $request, PostExcelService $excel): RedirectResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt', 'max:5120']]);

        try {
            $count = $excel->import($request->user(), $request->file('file'));
        } catch (Throwable) {
            return back()->with('error', 'Berkas Excel tidak dapat dibaca. Pastikan formatnya benar.');
        }

        return back()->with('success', "{$count} artikel berhasil diimpor.");
    }

    public function aiGenerate(Request $request, AiClientInterface $ai): RedirectResponse
    {
        $data = $request->validate([
            'topic' => ['required', 'string', 'max:200'],
            'count' => ['required', 'integer', 'min:1', 'max:5'],
            'category' => ['nullable', Rule::in(PostCategory::values())],
        ]);

        try {
            $items = $ai->generatePosts($data['topic'], (int) $data['count'], $data['category'] ?? null);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()
            ->with('success', count($items).' draf artikel dihasilkan. Periksa lalu simpan.')
            ->with('aiDrafts', array_map(fn ($item) => $item->toArray(), $items));
    }

    public function aiSave(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:5'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.category' => ['required', Rule::in(PostCategory::values())],
            'items.*.excerpt' => ['nullable', 'string', 'max:500'],
            'items.*.content' => ['required', 'string'],
        ]);

        $count = $this->posts->createMany($request->user(), $data['items']);

        return back()->with('success', "{$count} artikel AI disimpan sebagai draf.");
    }
}
