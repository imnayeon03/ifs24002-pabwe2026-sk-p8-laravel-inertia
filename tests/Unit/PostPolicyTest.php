<?php

namespace Tests\Unit;

use App\Features\Post\Models\Post;
use App\Features\Post\Policies\PostPolicy;
use App\Models\User;
use PHPUnit\Framework\TestCase;

class PostPolicyTest extends TestCase
{
    public function test_only_owner_can_manage(): void
    {
        $owner = new User;
        $owner->id = 1;
        $other = new User;
        $other->id = 2;
        $post = new Post;
        $post->user_id = 1;

        $policy = new PostPolicy;

        $this->assertTrue($policy->manage($owner, $post));
        $this->assertFalse($policy->manage($other, $post));
    }

    public function test_user_role_helper(): void
    {
        $user = new User(['role' => User::ROLE_ADMIN]);

        $this->assertTrue($user->isAdmin());
        $this->assertFalse((new User(['role' => 'member']))->isAdmin());
    }
}
