<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'parent_id', 'icon', 'order'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($category) {
            if (!isset($category->order) || $category->order === 0) {
                $category->order = Category::where('parent_id', $category->parent_id)->max('order') + 1;
            }
        });
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('order');
    }

    public function allChildren()
    {
        return $this->children()->with(['allChildren', 'pages']);
    }

    public function pages()
    {
        // For later: a category has many pages
        return $this->hasMany(Page::class);
    }
}
