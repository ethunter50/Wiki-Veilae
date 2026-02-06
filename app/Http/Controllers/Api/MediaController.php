<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function upload(Request $request)
    {
        \Log::info('Upload attempt', [
            'hasFile' => $request->hasFile('image'),
            'fileInfo' => $request->file('image') ? [
                'name' => $request->file('image')->getClientOriginalName(),
                'size' => $request->file('image')->getSize(),
                'mime' => $request->file('image')->getMimeType(),
            ] : 'no file'
        ]);

        $request->validate([
            'image' => 'required', // Just required, no 'image' or 'mimes' for now
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // On s'assure que le dossier existe
            if (!Storage::disk('public')->exists('wiki-images')) {
                Storage::disk('public')->makeDirectory('wiki-images');
            }

            $path = $file->storeAs('wiki-images', $fileName, 'public');
            
            // Construire l'URL manuellement pour être sûr
            $baseUrl = rtrim(config('app.url'), '/');
            $url = $baseUrl . '/storage/' . $path;
            
            return response()->json([
                'url' => $url,
                'message' => 'Image uploadée avec succès'
            ]);
        }

        return response()->json(['message' => 'Aucune image trouvée'], 400);
    }
}
