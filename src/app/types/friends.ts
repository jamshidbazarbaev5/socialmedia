export interface FriendRequest {
    id: string;
    sender_id: string;
    recipient_id: string;
    sender_username: string;
    sender_first_name: string;
    sender_last_name: string;
    sender_avatar: string | null;
    status: 'SENT' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
    updated_at: string;
    url: string;
    created_by: string;
}