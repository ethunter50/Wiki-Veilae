<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Page;
use Illuminate\Http\Request;

class StructureController extends Controller
{
    public function reorder(Request $request)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer',
            'items.*.type' => 'required|in:category,page',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            if ($item['type'] === 'category') {
                Category::where('id', $item['id'])->update(['order' => $item['order']]);
            } else {
                Page::where('id', $item['id'])->update(['order' => $item['order']]);
            }
        }

        return response()->json(['message' => 'Structure updated']);
    }
}
