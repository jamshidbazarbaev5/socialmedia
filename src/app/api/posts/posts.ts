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
