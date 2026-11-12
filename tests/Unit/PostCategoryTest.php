<?php

namespace Tests\Unit;

use App\Features\Post\Enums\PostCategory;
use PHPUnit\Framework\TestCase;

class PostCategoryTest extends TestCase
{
    public function test_has_six_categories_with_expected_values(): void
    {
        $this->assertSame(
            ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'],
            PostCategory::values()
        );
    }

    public function test_labels_and_options(): void
    {
        $labels = array_map(fn (PostCategory $c) => $c->label(), PostCategory::cases());

        $this->assertSame([
            'Teknologi & Koding', 'Pendidikan & Tutorial', 'Gaya Hidup & Produktivitas',
            'Bisnis & Karir', 'Opini & Pemikiran', 'Umum',
        ], $labels);
        $this->assertSame(['value' => 'Gaya Hidup', 'label' => 'Gaya Hidup & Produktivitas'], PostCategory::options()[2]);
    }
}
