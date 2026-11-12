<?php

namespace App\Features\Post\Services;

use App\Features\Post\Enums\PostCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class PostExcelService
{
    public const HEADERS = ['Judul', 'Kategori', 'Ringkasan', 'Isi', 'Status', 'Dipublikasikan'];

    private const PUBLISHED_WORDS = ['published', 'terbit', 'publikasi', 'dipublikasikan', 'ya', '1'];

    public function __construct(private readonly PostService $posts) {}

    /** Membuat berkas .xlsx sementara dan mengembalikan path-nya. */
    public function export(Collection $posts, bool $withAuthor = false): string
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Artikel');

        $headers = $withAuthor ? ['Penulis', ...self::HEADERS] : self::HEADERS;
        foreach ($headers as $i => $header) {
            $sheet->setCellValueExplicit([$i + 1, 1], $header, DataType::TYPE_STRING);
            $sheet->getColumnDimensionByColumn($i + 1)->setWidth(30);
        }
        $sheet->getStyle([1, 1, count($headers), 1])->getFont()->setBold(true);

        $row = 2;
        foreach ($posts as $post) {
            $values = [
                $post->title,
                $post->category->value,
                $post->excerpt,
                $post->content,
                $post->is_published ? 'Published' : 'Draft',
                $post->published_at?->format('Y-m-d H:i'),
            ];
            if ($withAuthor) {
                array_unshift($values, $post->user?->name);
            }
            foreach ($values as $i => $value) {
                // Selalu string eksplisit agar isi berawalan "=" tidak dieksekusi sebagai rumus.
                $sheet->setCellValueExplicit([$i + 1, $row], (string) $value, DataType::TYPE_STRING);
            }
            $row++;
        }

        $path = tempnam(sys_get_temp_dir(), 'posts_');
        (new Xlsx($spreadsheet))->save($path);
        $spreadsheet->disconnectWorksheets();

        return $path;
    }

    /** Mengimpor artikel (kolom: Judul, Kategori, Ringkasan, Isi, Status). Mengembalikan jumlah yang dibuat. */
    public function import(User $user, UploadedFile $file): int
    {
        $spreadsheet = IOFactory::load($file->getRealPath());
        $rows = $spreadsheet->getActiveSheet()->toArray(null, false, false, false);

        $count = 0;
        foreach (array_slice($rows, 1) as $row) {
            $title = trim((string) ($row[0] ?? ''));
            $content = trim((string) ($row[3] ?? ''));
            if ($title === '' || $content === '') {
                continue;
            }

            $this->posts->create($user, [
                'title' => Str::limit($title, 255, ''),
                'category' => (PostCategory::tryFrom(trim((string) ($row[1] ?? ''))) ?? PostCategory::Umum)->value,
                'excerpt' => trim((string) ($row[2] ?? '')) ?: null,
                'content' => $content,
                'is_published' => in_array(mb_strtolower(trim((string) ($row[4] ?? ''))), self::PUBLISHED_WORDS, true),
            ]);
            $count++;
        }

        return $count;
    }
}
