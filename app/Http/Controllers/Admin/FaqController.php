<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Faqs/Index', [
            'faqs' => Faq::orderBy('position')->paginate(20)
        ]);
    }

    public function export()
    {
        $faqs = Faq::orderBy('position')->get();

        $filename = "faqs_export_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['ID', 'Question', 'Answer', 'Position', 'Status', 'Created At'];

        $callback = function() use($faqs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($faqs as $f) {
                fputcsv($file, [
                    $f->id,
                    $f->question,
                    strip_tags($f->answer),
                    $f->position,
                    $f->status,
                    $f->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'status' => 'required|in:published,inactive',
            'position' => 'required|integer'
        ]);

        Faq::create($request->all());

        return back()->with('success', 'FAQ created successfully.');
    }

    public function update(Request $request, Faq $faq)
    {
        $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'status' => 'required|in:published,inactive',
            'position' => 'required|integer'
        ]);

        $faq->update($request->all());

        return back()->with('success', 'FAQ updated successfully.');
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();
        return back()->with('success', 'FAQ deleted successfully.');
    }
}
