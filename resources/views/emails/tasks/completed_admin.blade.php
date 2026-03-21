<x-mail::message>
# Task Completed by User

Hello Admin,

A user has successfully completed all required orders for an assigned task. The system has automatically credited their wallet with the earned commissions.

**User Details:**
- **Name:** {{ $user->name }}
- **Email:** {{ $user->email }}

**Task Completion Summary:**
- **Task Name:** {{ $userTask->orderTask->title }}
- **Completed Orders:** {{ $userTask->completed_orders }}/{{ $userTask->orderTask->required_orders }}
- **Commission Paid Out:** ${{ number_format($userTask->total_earned_commission, 2) }}

You can review this user's activity log or wallet transactions in the admin dashboard.

<x-mail::button :url="config('app.url') . '/admin/users/' . $user->id">
View User Profile
</x-mail::button>

Thanks,<br>
System Robot
</x-mail::message>
