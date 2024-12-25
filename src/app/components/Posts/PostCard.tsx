'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Flag, UserCircle } from 'lucide-react'
import { SimpleDropdown, DropdownItem } from '@/app/components/dropdown/dropdown'
import { useDeletePost, useLikePost, useGetPostComments, useCreateComment, extractPostId, useGetCommentReplies, useCreateReply } from '@/app/api/posts/posts'
import { useQueryClient } from "@tanstack/react-query"
import { api } from '@/app/api/api'

interface PostAttachment {
  image: string
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

interface PostCardProps {
  url: string
  id: string
  content: string
  post_attachments?: PostAttachment[]
  likes_count: number
  comments_count: number
  user: {
    username: string
    avatar: string
  }
  created_at: string
  isLiked?: boolean
  comments?: Comment[]
  profileId: string
  currentUserId?: string
  onDeleteSuccess?: () => void
}

export function PostCard({
  url,
  id,
  content,
  post_attachments,
  likes_count: initialLikesCount = 0,
  comments_count,
  user,
  created_at,
  isLiked: initialIsLiked = false,
  comments: initialComments = [],
  profileId,
  currentUserId,
  onDeleteSuccess,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const deletePost = useDeletePost()
  const [isDeleting, setIsDeleting] = useState(false)
  const likePost = useLikePost()
  const queryClient = useQueryClient()
  const { data: comments = [], isLoading: isLoadingComments } = useGetPostComments(url)
  const createComment = useCreateComment()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({})
  const [newReply, setNewReply] = useState<{ [key: string]: string }>({})
  const createReply = useCreateReply()
  const [repliesData, setRepliesData] = useState<{ [key: string]: any[] }>({})
  const [loadingReplies, setLoadingReplies] = useState<{ [key: string]: boolean }>({})

  console.log(comments)
  useEffect(() => {
    setIsLiked(initialIsLiked)
    setLikesCount(initialLikesCount)
  }, [initialIsLiked, initialLikesCount])

  const handleLikeClick = async () => {
    if (!currentUserId) return;
    
    try {
      const postId = extractPostId(url) || '';
      
      // Optimistically update UI
      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
      
      await likePost.mutateAsync({ 
        profileId: currentUserId, 
        postId 
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(isLiked)
      setLikesCount(likesCount)
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      await createComment.mutateAsync({
        postUrl: url,
        content: newComment
      })
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return
    
    const postId = extractPostId(url)
    
    if (!postId) {
      console.error('Invalid post URL:', url)
      alert('Could not delete post: Invalid post ID')
      return
    }
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true)
      try {
        await deletePost.mutateAsync({ 
          profileId, 
          postId 
        })
        onDeleteSuccess?.()
      } catch (error) {
        console.error('Failed to delete post:', error)
        alert('Failed to delete post')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const isPostOwner = currentUserId === profileId

  const extractCommentId = (replyUrl: string) => {
    const matches = replyUrl.match(/comments\/([^/]+)\/replies/);
    return matches ? matches[1] : null;
  }

  const fetchReplies = async (postId: string, commentId: string) => {
    if (!commentId) return;
    
    setLoadingReplies(prev => ({ ...prev, [commentId]: true }))
    try {
      const response = await api.get(`/posts/${postId}/comments/${commentId}/replies/`)
      setRepliesData(prev => ({ ...prev, [commentId]: response.data }))
    } catch (error) {
      console.error('Failed to fetch replies:', error)
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const handleToggleReplies = async (commentId: string) => {
    setShowReplies(prev => {
      const newState = { ...prev, [commentId]: !prev[commentId] }
      
      // Fetch replies if showing and not already loaded
      if (newState[commentId] && !repliesData[commentId]) {
        const postId = extractPostId(url)
        if (postId) {
          fetchReplies(postId, commentId)
        }
      }
      
      return newState
    })
  }

  const handleReplySubmit = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!commentId || !newReply[commentId]?.trim()) return

    try {
      const postId = extractPostId(url)
      if (!postId) throw new Error('Invalid post URL')

      const response = await api.post(`/posts/${postId}/comments/${commentId}/replies/`, {
        reply: newReply[commentId]
      })

      // Update replies data
      setRepliesData(prev => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), response.data]
      }))
      
      // Clear input
      setNewReply(prev => ({ ...prev, [commentId]: '' }))
    } catch (error) {
      console.error('Failed to add reply:', error)
      alert('Failed to add reply')
    }
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Image
            src={user.avatar || '/placeholder.svg'}
            alt={user.username}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="font-semibold">{user.username}</p>
            <p className="text-xs text-zinc-400">
              {new Date(created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {isPostOwner && (
          <SimpleDropdown 
            trigger={
              <button className="hover:bg-zinc-800/50 p-2 rounded-full transition-colors duration-150">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            }
          >
            <DropdownItem 
              onClick={handleDelete}
              disabled={isDeleting}
              destructive
              icon={<Trash2 className="w-4 h-4" />}
            >
              {isDeleting ? 'Deleting...' : 'Delete Post'}
            </DropdownItem>
            
            <DropdownItem 
              onClick={() => {/* handle share */}}
              icon={<Share2 className="w-4 h-4" />}
            >
              Share Post
            </DropdownItem>
            
            <DropdownItem 
              onClick={() => {/* handle report */}}
              icon={<Flag className="w-4 h-4" />}
            >
              Report Post
            </DropdownItem>
          </SimpleDropdown>
        )}
      </div>

      {/* Post Content */}
      <p className="text-white mb-4">{content}</p>

      {/* Post Attachments */}
      {post_attachments && post_attachments.length > 0 && (
        <div className="mb-4">
          {post_attachments.map((attachment, index) => (
            <Image
              key={index}
              src={attachment.image}
              alt={`Post attachment ${index + 1}`}
              width={500}
              height={300}
              className="rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={handleLikeClick}
          disabled={likePost.isPending}
          className="flex items-center gap-1"
        >
          {isLiked ? (
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          ) : (
            <Heart className="h-5 w-5" />
          )}
          <span>{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg"
        >
          <MessageCircle className="h-5 w-5" />
          {comments.length}
        </button>
        <button className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4">
          {isLoadingComments ? (
            <div className="text-center py-4 text-zinc-400">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-zinc-400">No comments yet</div>
          ) : (
            comments.map((comment) => {
              const commentId = extractCommentId(comment.replies);
              const replies = repliesData[commentId || ''] || [];
              const isLoadingReplies = loadingReplies[commentId || ''];

              return (
                <div key={comment.replies} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                      {comment.profile?.avatar ? (
                        <Image
                          src={comment.profile.avatar}
                          alt={comment.profile.username}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-full h-full text-white p-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-zinc-400">{comment.profile.username}</p>
                        </div>
                        <p className="text-sm mt-1">{comment.comment}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                          <span>{comment.created_at}</span>
                          <span>{comment.likes} likes</span>
                          <span>{comment.dislikes} dislikes</span>
                          <button
                            onClick={() => handleToggleReplies(commentId || '')}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {showReplies[commentId || ''] ? 'Hide replies' : 'Show replies'}
                          </button>
                        </div>
                      </div>

                      {showReplies[commentId || ''] && (
                        <div className="ml-8 mt-2 space-y-2">
                          {isLoadingReplies ? (
                            <p className="text-sm text-zinc-400">Loading replies...</p>
                          ) : (
                            <>
                              {replies.map((reply, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800">
                                    {reply.profile.avatar ? (
                                      <Image
                                        src={reply.profile.avatar}
                                        alt={reply.profile.username}
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <UserCircle className="w-full h-full text-white p-1" />
                                    )}
                                  </div>
                                  <div className="flex-1 bg-zinc-800 p-2 rounded-lg">
                                    <p className="text-xs text-zinc-400">{reply.profile.username}</p>
                                    <p className="text-sm">{reply.reply}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                                      <span>{reply.created_at}</span>
                                      <span>{reply.likes} likes</span>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <form 
                                onSubmit={(e) => handleReplySubmit(commentId || '', e)}
                                className="flex gap-2"
                              >
                                <input
                                  type="text"
                                  placeholder="Add a reply..."
                                  value={newReply[commentId || ''] || ''}
                                  onChange={(e) => setNewReply(prev => ({
                                    ...prev,
                                    [commentId || '']: e.target.value
                                  }))}
                                  className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1 text-sm text-white"
                                />
                                <button
                                  type="submit"
                                  disabled={createReply.isPending || !newReply[commentId || '']?.trim()}
                                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Reply
                                </button>
                              </form>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingComment ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}