'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'

interface PostAttachment {
  image: string
}

interface Comment {
  id: string
  content: string
  user: {
    username: string
    avatar: string
  }
  created_at: string
}

interface PostCardProps {
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
}

export function PostCard({
  id,
  content,
  post_attachments,
  likes_count: initialLikesCount,
  comments_count,
  user,
  created_at,
  isLiked: initialIsLiked = false,
  comments: initialComments = [],
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      })

      if (!response.ok) throw new Error('Failed to update like')

      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (error) {
      console.error('Failed to update like:', error)
      alert('Failed to update like')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) throw new Error('Failed to add comment')

      const newCommentData = await response.json()
      setComments(prev => [...prev, newCommentData])
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment')
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
        <button className="p-2 hover:bg-zinc-800 rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </button>
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
          onClick={handleLike}
          className={`flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg ${
            isLiked ? 'text-red-500' : ''
          }`}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          {likesCount}
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
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Image
                src={comment.user.avatar || '/placeholder.svg'}
                alt={comment.user.username}
                width={32}
                height={32}
                className="rounded-full"
              />
              <div className="flex-1 bg-zinc-800 p-3 rounded-lg">
                <p className="font-semibold text-sm">{comment.user.username}</p>
                <p className="text-sm">{comment.content}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

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
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  )
}