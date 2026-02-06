<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index()
    {
        return response()->json(Page::with(['user', 'children', 'category'])->orderBy('updated_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:pages,id',
            'content' => 'nullable|array',
            'icon' => 'nullable|string',
            'tag' => 'nullable|string|max:50',
            'tag_color' => 'nullable|string|max:20',
            'category_id' => 'nullable|exists:categories,id',
            'is_published' => 'boolean',
        ]);

        $slug = Str::slug($validated['title']);

        // Vérifier si le slug existe déjà
        if (Page::where('slug', $slug)->exists()) {
            return response()->json([
                'message' => 'Une page avec ce titre existe déjà (doublon de lien).',
                'errors' => ['title' => ['Ce titre génère un lien qui est déjà utilisé.']]
            ], 422);
        }

        $validated['user_id'] = $request->user()->id;
        $validated['slug'] = $slug;

        $page = Page::create($validated);

        return response()->json($page, 201);
    }

    public function show($id)
    {
        // Use find or slug
        $page = Page::where('id', $id)->orWhere('slug', $id)->with(['user', 'children', 'category'])->firstOrFail();
        return response()->json($page);
    }

    public function update(Request $request, Page $page)
    {
        // Only creator, admin or documentaliste can update
        if ($request->user()->id !== $page->user_id && $request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:pages,slug,' . $page->id,
            'content' => 'nullable|array',
            'icon' => 'nullable|string',
            'parent_id' => 'nullable|exists:pages,id',
            'tag' => 'nullable|string|max:50',
            'tag_color' => 'nullable|string|max:20',
            'category_id' => 'nullable|exists:categories,id',
            'is_published' => 'boolean',
            'order' => 'integer',
        ]);

        $page->update($validated);

        return response()->json($page);
    }

    public function destroy(Page $page, Request $request)
    {
        if ($request->user()->id !== $page->user_id && $request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $page->delete();

        return response()->json(['message' => 'Page supprimée']);
    }

    public function reorder(Request $request)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'pages' => 'required|array',
            'pages.*.id' => 'required|exists:pages,id',
            'pages.*.order' => 'required|integer',
        ]);

        foreach ($validated['pages'] as $pageData) {
            Page::where('id', $pageData['id'])->update(['order' => $pageData['order']]);
        }

        return response()->json(['message' => 'Ordre mis à jour']);
    }
}
