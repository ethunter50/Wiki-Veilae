<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'user_id',
        'parent_id',
        'order',
        'icon',
        'cover_image',
        'is_published',
        'tag',
        'tag_color',
        'category_id',
    ];


    protected $casts = [
        'content' => 'array',
        'is_published' => 'boolean',
    ];


    protected static function boot()
    {
        parent::boot();

        static::creating(function ($page) {
            if (empty($page->slug)) {
                $page->slug = Str::slug($page->title) . '-' . Str::random(5);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function children()
    {
        return $this->hasMany(Page::class, 'parent_id')->orderBy('order');
    }

    public function parent()
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
