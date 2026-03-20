<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        
        $announcements = Announcement::where('status', 'published')
            ->orderByDesc('is_pinned')
            ->latest()
            ->paginate(15);
            
        // Check read status
        $readIds = \App\Models\UserAnnouncementRead::where('user_id', $userId)
            ->whereIn('announcement_id', $announcements->pluck('id'))
            ->pluck('announcement_id')->toArray();
            
        $announcements->getCollection()->transform(function($a) use ($readIds) {
            $a->is_read = in_array($a->id, $readIds);
            return $a;
        });
        
        $unreadCount = Announcement::where('status', 'published')
            ->whereNotIn('id', function($q) use ($userId) {
                $q->select('announcement_id')
                  ->from('user_announcement_reads')
                  ->where('user_id', $userId);
            })->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'announcements' => $announcements,
                'unread_count' => $unreadCount
            ]
        ]);
    }

    public function markAsRead($id)
    {
        $announcement = Announcement::findOrFail($id);
        
        \App\Models\UserAnnouncementRead::firstOrCreate([
            'user_id' => auth()->id(),
            'announcement_id' => $announcement->id
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement marked as read.'
        ]);
    }
}
