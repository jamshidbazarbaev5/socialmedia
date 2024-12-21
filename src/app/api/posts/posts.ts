import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

interface PostAttachment {
  image: string
}

interface Post {
  url: string          // readOnly
  content: string
  post_attachments: PostAttachment[]
  created_at: string   // readOnly
  likes: number        // readOnly
  comments: string     // readOnly, URI
}

interface CreatePostRequest {
  content: string;
  post_attachments: Array<{
    image: string;  
  }>;
}

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
      
      const files = formData.getAll('post_attachments')
      if (files.length > 0) {
        files.forEach((file) => {
          if (file instanceof File) {
            requestData.append('image', file)
          }
        })
      }

      console.log('Sending request with FormData contents:')
      for (let pair of requestData.entries()) {
        console.log(pair[0], ':', pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
      }

      const response = await api.post(`/profile/${profileId}/posts/`, requestData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    },
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', profileId] })
    },
    onError: (error: any) => {
      console.error('Post creation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw error
    }
  })
}
