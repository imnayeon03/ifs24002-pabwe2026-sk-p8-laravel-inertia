<?php

namespace Tests\Unit;

use App\Features\Ai\DTO\GeneratedPostItem;
use PHPUnit\Framework\TestCase;

class GeneratedPostItemTest extends TestCase
{
    public function test_from_array_normalizes_values(): void
    {
        $item = GeneratedPostItem::fromArray(['title' => '  Judul ', 'category' => 'Opini', 'excerpt' => ' ring ', 'content' => ' isi ']);

        $this->assertSame(['title' => 'Judul', 'category' => 'Opini', 'excerpt' => 'ring', 'content' => 'isi'], $item->toArray());
    }

    public function test_from_array_applies_defaults(): void
    {
        $item = GeneratedPostItem::fromArray(['category' => 'Tidak Ada']);

        $this->assertSame('Tanpa Judul', $item->title);
        $this->assertSame('Umum', $item->category);
        $this->assertNull($item->excerpt);
        $this->assertSame('', $item->content);
    }
}
