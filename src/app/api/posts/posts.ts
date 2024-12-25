import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

interface PostAttachment {
  image: string
}

interface Post {
  url: string          
  content: string
  post_attachments: PostAttachment[]
  created_at: string   
  likes: number        // Change this to match the API response
  comments_count: number
  is_liked: boolean    
  comments: string     
}

interface CreatePostRequest {
  content: string;
  post_attachments: Array<{
    image: string;  
  }>;
}

interface Like {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  created_at: string;
}

interface Comment {
  profile: {
    url: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  comment: string;
  created_at: string;
  replies: string;
  likes: number;
  dislikes: number;
}

interface CreateCommentRequest {
  content: string;
}

interface Reply {
  profile: {
    url: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  reply: string;
  created_at: string;
  likes: number;
  dislikes: number;
}

export const extractPostId = (url: string): string | null => {
  // Try to extract from comments URL first
  let matches = url.match(/posts\/([^/]+)\/comments/);
  if (matches) return matches[1];
  
  // Try to extract from post URL
  matches = url.match(/posts\/([^/]+)/);
  if (matches) return matches[1];
  
  return null;
};

export const useGetProfilePosts = (profileId: string) => {
  return useQuery({
    queryKey: ['posts', profileId],
    queryFn: async (): Promise<Post[]> => {
      const response = await api.get(`/profile/${profileId}/posts/`)
      return response.data
    }
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ profileId, formData }: { profileId: string, formData: FormData }) => {
      const requestData = new FormData()
      
      requestData.append('content', formData.get('content') as string)
      
      const files = formData.getAll('uploaded_images')
      if (files.length > 0) {
        files.forEach((file) => {
          if (file instanceof File) {
            requestData.append('uploaded_images', file)
          }
        })
      }

      console.log('Request Data:')
      for (let pair of requestData.entries()) {
        console.log(pair[0], ':', pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
      }

      try {
        const response = await api.post(`/profile/${profileId}/posts/`, requestData, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } catch (err: any) {
        console.error('API Error Details:', {
          error: err,
          errorMessage: err.message,
          responseData: err.response?.data,
          responseStatus: err.response?.status,
          requestData: {
            content: requestData.get('content'),
            filesCount: files.length,
            endpoint: `/profile/${profileId}/posts/`
          }
        })
        throw err
      }
    },
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', profileId] })
    },
    onError: (error: any) => {
      const errorDetails = {
        message: error?.message || 'Unknown error occurred',
        response: error?.response?.data || {},
        status: error?.response?.status || 'No status',
        name: error?.name || 'Error'
      }
      
      console.error('Post creation error:', errorDetails)
      throw error
    }
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ profileId, postId }: { profileId: string, postId: string }) => {
      const response = await api.delete(`/profile/${profileId}/posts/${postId}/`)
      return response.data
    },
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', profileId] })
    },
    onError: (error: any) => {
      console.error('Post deletion error:', error)
      throw error
    }
  })
}

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, postId }: { profileId: string, postId: string }) => {
      const response = await api.post(`/profile/${profileId}/posts/${postId}/like/`);
      return response.data;
    },
    onSuccess: (data, { profileId, postId }) => {
      // Update all queries that might contain this post
      queryClient.invalidateQueries({ queryKey: ['posts', profileId] });
      
      // If you have a single post query, update that too
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: (error) => {
      console.error('Like post error:', error);
      throw error;
    }
  });
};

export const useGetPostLikes = (profileId: string, postId: string) => {
  return useQuery({
    queryKey: ['postLikes', postId],
    queryFn: async (): Promise<Like[]> => {
      const response = await api.get(`/profile/${profileId}/posts/${postId}/likes/`)
      return response.data
    }
  })
}

export const useGetPostComments = (postUrl: string) => {
  const postId = extractPostId(postUrl);

  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: async (): Promise<Comment[]> => {
      if (!postId) throw new Error('Invalid post URL');
      const response = await api.get(`/posts/${postId}/comments/`)
      return response.data
    },
    enabled: !!postId // Only run the query if we have a valid post ID
  })
}

export const useCreateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postUrl, content }: { postUrl: string, content: string }) => {
      const postId = extractPostId(postUrl);
      if (!postId) throw new Error('Invalid post URL');
      
      const response = await api.post(`/posts/${postId}/comments/`, {
        comment: content
      })
      return response.data
    },
    onSuccess: (_, { postUrl }) => {
      const postId = extractPostId(postUrl);
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ['postComments', postId] })
        queryClient.invalidateQueries({ queryKey: ['posts'] })
      }
    },
    onError: (error: any) => {
      console.error('Create comment error:', error)
      throw error
    }
  })
}

export const useGetCommentReplies = (postId: string, commentId: string) => {
  return useQuery({
    queryKey: ['commentReplies', commentId],
    queryFn: async (): Promise<Reply[]> => {
      const response = await api.get(`/posts/${postId}/comments/${commentId}/replies/`)
      return response.data
    }
  })
}

export const useCreateReply = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      postId, 
      commentId, 
      reply 
    }: { 
      postId: string, 
      commentId: string, 
      reply: string 
    }) => {
      const response = await api.post(`/posts/${postId}/comments/${commentId}/replies/`, {
        reply
      })
      return response.data
    },
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: ['commentReplies', commentId] })
    }
  })
}

