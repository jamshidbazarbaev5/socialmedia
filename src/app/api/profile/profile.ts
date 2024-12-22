import {useMutation, useQuery,QueryClient, useQueryClient} from "@tanstack/react-query";
import { api } from "@/app/api/api";
import {id} from "postcss-selector-parser";
import axios from "axios";
import { FriendRequest } from '@/app/types/friends'
import { useAuth } from '@/app/context/AuthContext'     
const queryClient = new QueryClient();

export enum FriendshipStatus {
    SENT = 'SENT',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

interface FriendStatusResponse {
    status: FriendshipStatus;
}

export const getUserProfile = async (id: string) => {
    if (!id) {
        throw new Error('Profile ID is required');
    }
    
    try {
        console.log('Fetching profile for ID:', id);
        const response = await api.get(`/profile/${id}/`);
        console.log('Profile data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

export const useGetUserProfile = (id: string) => {
    return useQuery({
        queryKey: ['profile', id],
        queryFn: () => getUserProfile(id),
        enabled: !!id
    });
};
export const getUserFriends = async (id:string) => {
    const response = await api.get(`/profile/${id}/friends/`);
    return response.data;
}


export const useGetUserFriends = (id:string) => {
    return useQuery({
        queryKey: ['friends', id],
        queryFn: () => getUserFriends(id),
    });
}


export const getUserPosts =async (id:string)=>{
    const response = await api.get(`/profile/${id}/posts`);
    return response.data;
}
export const useGetPosts = (id:string) => {
    return useQuery({
        queryKey: ['posts', id],
        queryFn: () => getUserPosts(id),

    })
}



export const getProfiles =async  () =>{
   const response = await api.get(`/profile/`);
   return response.data;
}
export const useProfiles =() =>{
    return useQuery({
        queryKey: ['profiles' ],
        queryFn:()=>getProfiles()
    })
}

export const checkFriendStatus = async (targetId: string, currentUserId: string, targetUsername: string): Promise<FriendStatusResponse> => {
    try {
        console.log('Checking friend status for:', { 
            currentUserId, 
            targetId,
            targetUsername 
        });
        
        const response = await api.get(`/profile/${currentUserId}/friends/requests/`);
        console.log('Friend requests:', response.data);
        
        const relevantRequest = response.data.find((request: any) => {
            return request.created_by === targetUsername;
        });

        console.log('Found relevant request:', relevantRequest);

        if (!relevantRequest) {
            return { status: FriendshipStatus.REJECTED };
        }

        console.log('Request status:', relevantRequest.status);
        
        switch (relevantRequest.status.toUpperCase()) {
            case 'ACCEPTED':
                return { status: FriendshipStatus.ACCEPTED };
            case 'SENT':
                return { status: FriendshipStatus.SENT };
            default:
                return { status: FriendshipStatus.REJECTED };
        }
    } catch (error: any) {
        console.error('Error checking friend status:', error);
        return { status: FriendshipStatus.REJECTED };
    }
}

export const useCheckFriendStatus = (targetId: string, targetUsername: string) => {
    const { user } = useAuth();
    
    return useQuery({
        queryKey: ['friendStatus', targetId, user?.profile_id, targetUsername],
        queryFn: () => {
            if (!user?.profile_id || !targetId || !targetUsername) {
                return Promise.resolve({ status: FriendshipStatus.REJECTED });
            }
            return checkFriendStatus(targetId, user.profile_id, targetUsername);
        },
        enabled: !!user?.profile_id && !!targetId && !!targetUsername,
    });
}

interface AddFriendRequest {
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export const addFriend = async (id: string, userData: AddFriendRequest) => {
  try {
    const response = await api.post(`/profile/${id}/add_to_friends/`, userData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to add friend');
  }
}

export const useAddFriend = () => {
  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: AddFriendRequest }) => 
      addFriend(id, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['friendStatus', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
    }
  });
}

interface UpdateProfileData {
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  birthdate: string | null;
  school: string;
  hobbies: string[];
  is_public: boolean;
}

type UpdateProfilePayload = UpdateProfileData | FormData;

export const updateProfile = async (id: string, data: UpdateProfilePayload) => {
  try {
    const response = await api.put(`/profile/${id}/`, data, {
      headers: {
        ...(data instanceof FormData 
          ? { 'Content-Type': 'multipart/form-data' }
          : { 'Content-Type': 'application/json' }
        ),
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data || {};
    console.error('Validation errors:', errorMessage);
    throw errorMessage;
  }
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfilePayload }) => 
      updateProfile(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error.response?.data || error);
    }
  });
};

export const getFriendRequests = async (id: string): Promise<FriendRequest[]> => {
    try {
        const response = await api.get(`/profile/${id}/friends/requests/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        throw error;
    }
}

export const useGetFriendRequests = (profileId: string) => {
    return useQuery<FriendRequest[]>({
        queryKey: ['friendRequests', profileId],
        queryFn: () => getFriendRequests(profileId),
        enabled: !!profileId,
    });
}

export const sendFriendRequest = async (profileId: string, userData: any) => {
    try {
        const response = await api.post(`/profile/${profileId}/friends/requests/`, userData);
        return response.data;
    } catch (error) {
        console.error('Error sending friend request:', error);
        throw error;
    }
}

export const getFriendRequest = async (profileId: string, requestId: string) => {
    try {
        const response = await api.get(`/profile/${profileId}/friends/requests/${requestId}/`);
        return response.data as FriendRequest;
    } catch (error) {
        console.error('Error fetching friend request:', error);
        throw error;
    }
}

export const acceptFriendRequest = async (profileId: string, requestId: string) => {
    try {
        const response = await api.post(`/profile/${profileId}/friends/requests/${requestId}/accept_friendship/`);
        return response.data;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
}

export const rejectFriendRequest = async (profileId: string, requestId: string) => {
    try {
        const response = await api.put(`/profile/${profileId}/friends/requests/${requestId}/reject_friendship/`);
        return response.data;
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        throw error;
    }
}


export const useSendFriendRequest = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ profileId, userData }: { profileId: string; userData: any }) => 
            sendFriendRequest(profileId, userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friendRequests', id] });
            queryClient.invalidateQueries({ queryKey: ['friendStatus', id] });
        },
    });
}

export const useAcceptFriendRequest = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ profileId, requestId }: { profileId: string; requestId: string }) => 
            acceptFriendRequest(profileId, requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friendRequests', id] });
            queryClient.invalidateQueries({ queryKey: ['friendStatus', id] });
        },
    });
}

export const useRejectFriendRequest = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ profileId, requestId }: { profileId: string; requestId: string }) => 
            rejectFriendRequest(profileId, requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friendRequests', id] });
            queryClient.invalidateQueries({ queryKey: ['friendStatus', id] });
        },
    });
}

export const deleteFriend = async (profileId: string, friendId: string) => {
    try {
        const response = await api.delete(`/profile/${friendId}/remove_from_friends/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting friend:', error);
        throw error;
    }
}

export const useDeleteFriend = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ profileId, friendId }: { profileId: string; friendId: string }) => 
            deleteFriend(profileId, friendId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['friends', variables.profileId] });
            queryClient.invalidateQueries({ queryKey: ['friendStatus', variables.friendId] });
        },
    });
}




