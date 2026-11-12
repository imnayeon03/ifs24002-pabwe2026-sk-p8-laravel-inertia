<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use App\Features\Post\Services\PostExcelService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use RuntimeException;
use Tests\TestCase;

class PostExcelTest extends TestCase
{
    use RefreshDatabase;

    private function xlsx(array $rows): UploadedFile
    {
        $book = new Spreadsheet;
        $book->getActiveSheet()->fromArray($rows, null, 'A1');
        $path = tempnam(sys_get_temp_dir(), 'imp_').'.xlsx';
        (new Xlsx($book))->save($path);

        return new UploadedFile($path, 'artikel.xlsx', null, null, true);
    }

    public function test_member_exports_only_own_posts(): void
    {
        $user = User::factory()->create(['username' => 'rina']);
        Post::factory()->count(2)->for($user)->create();
        Post::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard/posts/export');

        $response->assertOk()->assertDownload('artikel-rina.xlsx');
        $sheet = IOFactory::load($response->baseResponse->getFile()->getPathname())->getActiveSheet();
        $this->assertSame('Judul', $sheet->getCell('A1')->getValue());
        $this->assertSame(3, $sheet->getHighestRow()); // header + 2 artikel
    }

    public function test_export_neutralizes_formula_injection(): void
    {
        $user = User::factory()->create();
        Post::factory()->for($user)->create(['title' => '=1+1']);

        $path = app(PostExcelService::class)->export(Post::all());
        $cell = IOFactory::load($path)->getActiveSheet()->getCell('A2');
        @unlink($path);

        $this->assertSame('=1+1', $cell->getValue());
        $this->assertSame('s', $cell->getDataType());
    }

    public function test_import_creates_posts_and_skips_invalid_rows(): void
    {
        $user = User::factory()->create();
        $file = $this->xlsx([
            ['Judul', 'Kategori', 'Ringkasan', 'Isi', 'Status'],
            ['Satu', 'Bisnis', 'Ring', 'Isi satu', 'Published'],
            ['Dua', 'KategoriAneh', '', 'Isi dua', 'Draft'],
            ['', 'Umum', '', 'tanpa judul', 'Draft'],
            ['Tanpa isi', 'Umum', '', '', 'Draft'],
            ['Tiga'],
        ]);

        $this->actingAs($user)->post('/dashboard/posts/import', ['file' => $file])
            ->assertSessionHas('success', '2 artikel berhasil diimpor.');

        $one = Post::where('title', 'Satu')->firstOrFail();
        $two = Post::where('title', 'Dua')->firstOrFail();
        $this->assertTrue($one->is_published);
        $this->assertSame('Bisnis', $one->category->value);
        $this->assertFalse($two->is_published);
        $this->assertSame('Umum', $two->category->value);
        $this->assertNull($two->excerpt);
        $this->assertSame($user->id, $one->user_id);
    }

    public function test_import_requires_file(): void
    {
        $this->actingAs(User::factory()->create())->post('/dashboard/posts/import', [])->assertSessionHasErrors('file');
    }

    public function test_import_reports_unreadable_file(): void
    {
        $this->mock(PostExcelService::class)->shouldReceive('import')->andThrow(new RuntimeException('rusak'));

        $this->actingAs(User::factory()->create())
            ->post('/dashboard/posts/import', ['file' => $this->xlsx([['a']])])
            ->assertSessionHas('error');
    }
}
