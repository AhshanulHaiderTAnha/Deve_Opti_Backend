<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserWithdrawalPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WithdrawalPasswordController extends Controller
{
    /**
     * Set a new withdrawal password.
     */
    public function set(Request $request)
    {
        $request->validate([
            'password' => 'required|string|min:4',
        ]);

        $user = Auth::user();

        // Check if already set
        if ($user->withdrawalPassword) {
            return response()->json([
                'status' => 'error',
                'message' => 'Withdrawal password already set. Use change instead.'
            ], 400);
        }

        UserWithdrawalPassword::create([
            'user_id' => $user->id,
            'password' => $request->password, // Stored as plain text per user request
        ]);

        \App\Models\UserActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Withdrawal Password Set',
            'details' => 'User set a new withdrawal password',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Withdrawal password set successfully.'
        ]);
    }

    /**
     * Change an existing withdrawal password.
     */
    public function change(Request $request)
    {
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:4',
        ]);

        $user = Auth::user();
        $withdrawalPassword = $user->withdrawalPassword;

        if (!$withdrawalPassword) {
            return response()->json([
                'status' => 'error',
                'message' => 'Withdrawal password not set yet.'
            ], 400);
        }

        // Verify old password (direct comparison since it's plain text)
        if ($withdrawalPassword->password !== $request->old_password) {
            return response()->json([
                'status' => 'error',
                'message' => 'The old withdrawal password you entered is incorrect.'
            ], 400);
        }

        $withdrawalPassword->update([
            'password' => $request->new_password,
        ]);

        \App\Models\UserActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Withdrawal Password Changed',
            'details' => 'User changed their withdrawal password',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Withdrawal password changed successfully.'
        ]);
    }
}
