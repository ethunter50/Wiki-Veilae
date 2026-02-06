<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        return response()->json(Tag::all());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:tags,name|max:50',
            'color' => 'nullable|string|max:20',
        ]);

        $tag = Tag::create([
            'name' => strtoupper($validated['name']),
            'color' => $validated['color'] ?? '#6366f1',
        ]);

        return response()->json($tag, 201);
    }

    public function update(Request $request, Tag $tag)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:50|unique:tags,name,' . $tag->id,
            'color' => 'nullable|string|max:20',
        ]);

        if (isset($validated['name'])) {
            $validated['name'] = strtoupper($validated['name']);
        }

        $tag->update($validated);

        return response()->json($tag);
    }

    public function destroy(Tag $tag, Request $request)
    {
        if ($request->user()->role !== 'admin' && $request->user()->role !== 'documentaliste') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tag->delete();
        return response()->json(['message' => 'Tag supprimé']);
    }
}
