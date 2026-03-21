<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderTask;
use App\Models\UserTask;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\TaskAssignedUser;

class UserTaskController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/OrderTasks/UserAssignments', [
            'assignments' => UserTask::with(['user:id,name,email', 'orderTask:id,title,required_orders,commission_type'])
                ->latest()
                ->paginate(15),
            'users' => User::where('role', 'user')->get(['id', 'name', 'email']),
            'tasks' => OrderTask::where('status', 'active')->get(['id', 'title', 'required_orders', 'commission_type'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'order_task_id' => 'required|exists:order_tasks,id',
        ]);

        // Check if user already has an active task
        $hasActive = UserTask::where('user_id', $validated['user_id'])
            ->where('status', 'in_progress')
            ->exists();

        if ($hasActive) {
            return back()->with('error', 'User already has an active task in progress. They must complete it first.');
        }

        $userTask = UserTask::create([
            'user_id' => $validated['user_id'],
            'order_task_id' => $validated['order_task_id'],
            'status' => 'in_progress',
            'completed_orders' => 0,
            'total_earned_commission' => 0
        ]);

        $user = User::find($validated['user_id']);

        // Send Email & Log Activity
        try {
            Mail::to($user->email)->queue(new TaskAssignedUser($userTask->load('orderTask'), $user));
        } catch (\Exception $e) {
            // Mute email errors
        }

        log_user_activity(
            $user,
            'Task Assigned',
            "Admin assigned you the task: {$userTask->orderTask->title}. Complete all {$userTask->orderTask->required_orders} orders to earn your commission."
        );

        return back()->with('success', 'Task successfully assigned to user and notification sent.');
    }

    public function destroy(UserTask $userTask)
    {
        if ($userTask->status === 'completed') {
            return back()->with('error', 'Cannot delete a completed task.');
        }
        
        $userTask->delete();
        return back()->with('success', 'Task assignment removed from user.');
    }
}
