import React, { useState } from 'react';
import { Button } from '../common/Button';
import './PostDetail.css';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  views: number;
}

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUser: string;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
  onLike,
  onAddComment,
  onLikeComment,
  onDeleteComment,
  currentUser,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post.id);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(post.id, newComment.trim());
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      onDeleteComment(commentId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="post-detail">
      <div className="detail-header">
        <Button
          title="← 뒤로"
          onClick={onBack}
          variant="outline"
          size="small"
          className="back-button"
        />
        <div className="post-category">{post.category}</div>
      </div>

      <div className="post-content">
        <h1 className="post-title">{post.title}</h1>
        
        <div className="post-meta">
          <div className="meta-left">
            <span className="post-author">{post.author}</span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>
          <div className="meta-right">
            <span className="post-views">👁️ {formatNumber(post.views)}</span>
          </div>
        </div>

        <div className="post-body">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="post-paragraph">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="post-actions">
          <Button
            title={`👍 좋아요 ${formatNumber(post.likes)}`}
            onClick={handleLike}
            variant={isLiked ? 'primary' : 'outline'}
            className="like-button"
          />
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">
          댓글 {post.comments.length}개
        </h3>

        <form className="comment-form" onSubmit={handleAddComment}>
          <textarea
            placeholder="댓글을 작성하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input"
            rows={3}
          />
          <Button
            title="댓글 작성"
            onClick={handleAddComment}
            variant="primary"
            size="small"
            className="comment-submit"
            disabled={!newComment.trim()}
          />
        </form>

        <div className="comments-list">
          {post.comments.length === 0 ? (
            <div className="no-comments">
              <p>첫 번째 댓글을 작성해보세요!</p>
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">
                    {formatCommentDate(comment.createdAt)}
                  </span>
                  {comment.author === currentUser && (
                    <button
                      className="delete-comment-button"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      삭제
                    </button>
                  )}
                </div>
                
                <div className="comment-content">
                  {comment.content}
                </div>
                
                <div className="comment-actions">
                  <button
                    className="comment-like-button"
                    onClick={() => onLikeComment(comment.id)}
                  >
                    👍 {formatNumber(comment.likes)}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
