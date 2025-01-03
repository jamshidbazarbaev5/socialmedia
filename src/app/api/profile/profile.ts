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
        const friendsResponse = await api.get(`/profile/${currentUserId}/friends/`);
        const isFriend = friendsResponse.data.some((friend: any) => friend.username === targetUsername);
        
        if (isFriend) {
            return { status: FriendshipStatus.ACCEPTED };
        }
        
        const requestsResponse = await api.get(`/profile/${currentUserId}/friends/requests/`);
        const relevantRequest = requestsResponse.data.find((request: any) => 
            request.created_by === targetUsername
        );

        if (!relevantRequest) {
            return { status: FriendshipStatus.REJECTED };
        }

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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: AddFriendRequest }) => 
      addFriend(id, userData),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['friendStatus', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
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
            // Invalidate all relevant queries
            queryClient.invalidateQueries({ queryKey: ['friends', variables.profileId] });
            queryClient.invalidateQueries({ queryKey: ['friendStatus', variables.friendId] });
            queryClient.invalidateQueries({ queryKey: ['profile', variables.friendId] });
            // Also invalidate the general friends list
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
    });
}

interface BlockUserResponse {
  success: boolean;
  message: string;
}

export const blockUser = async (userId: string): Promise<BlockUserResponse> => {
  try {
    const response = await api.post(`/profile/${userId}/block/`);
    return response.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

export const unblockUser = async (userId: string): Promise<BlockUserResponse> => {
  try {
    const response = await api.put(`/profile/${userId}/unblock/`);
    return response.data;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const deleteFriendMutation = useDeleteFriend();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // First delete from friends if they are friends
      try {
        await deleteFriendMutation.mutateAsync({
          profileId: user?.profile_id || '',
          friendId: userId
        });
      } catch (error) {
        console.log('User was not a friend or error removing friend:', error);
      }
      

      return blockUser(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['blacklist', user?.profile_id] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['friends', user?.profile_id] });
      queryClient.invalidateQueries({ queryKey: ['friendStatus', userId] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (userId: string) => unblockUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['blacklist', user?.profile_id] })
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  });
};

interface BlacklistResponse {
  profiles: {
    url: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  }[];
}

export const getBlacklist = async (userId: string): Promise<BlacklistResponse> => {
  try {
    const response = await api.get(`/profile/${userId}/blacklist/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    throw error;
  }
};

export const useCheckBlacklist = (targetUsername: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['blacklist', user?.profile_id, targetUsername],
    queryFn: async () => {
      if (!user?.profile_id) return false;
      try {
        const blacklist = await getBlacklist(user.profile_id);
        return blacklist.profiles.some(profile => profile.username === targetUsername);
      } catch (error) {
        console.error('Error fetching blacklist:', error);
        return false;
      }
    },
    enabled: !!user?.profile_id && !!targetUsername
  });
};

export const checkIfBlockedByUser = async (targetUserId: string): Promise<boolean> => {
  try {
    // Try to fetch the user's profile - if we're blocked, this will return 403
    await api.get(`/profile/${targetUserId}/`);
    return false; // If we can access the profile, we're not blocked
  } catch (error: any) {
    // If we get a 403 error, it means we're blocked
    if (error.response?.status === 403) {
      return true;
    }
    // For other errors, assume we're not blocked
    console.error('Error checking if blocked by user:', error);
    return false;
  }
};

export const useCheckBlockedByUser = (targetUserId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['blockedBy', targetUserId, user?.username],
    queryFn: () => {
      if (!user?.username || !targetUserId) return false;
      return checkIfBlockedByUser(targetUserId);
    },
    enabled: !!user?.username && !!targetUserId,
    retry: false, // Don't retry on failure
    staleTime: 30000, // Cache the result for 30 seconds
  });
};








