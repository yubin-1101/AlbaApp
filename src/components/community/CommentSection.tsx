import React, { useState } from 'react';
import { Button } from '../common/Button';
import './CommentSection.css';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  currentUser: string;
  onAddComment: (content: string, parentId?: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onReplyComment: (commentId: string, content: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onReplyComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const handleEditComment = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editingId) {
      onEditComment(editingId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  const handleSubmitReply = () => {
    if (replyContent.trim() && replyingTo) {
      onReplyComment(replyingTo, replyContent.trim());
      setReplyingTo(null);
      setReplyContent('');
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const formatDate = (dateString: string) => {
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

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`comment-item ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <div className="comment-info">
          <span className="comment-author">{comment.author}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        {comment.author === currentUser && (
          <div className="comment-actions">
            <button
              className="action-button edit-button"
              onClick={() => handleEditComment(comment)}
            >
              수정
            </button>
            <button
              className="action-button delete-button"
              onClick={() => onDeleteComment(comment.id)}
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {editingId === comment.id ? (
        <div className="edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-input"
            rows={3}
          />
          <div className="edit-actions">
            <Button
              title="저장"
              onClick={handleSaveEdit}
              variant="primary"
              size="small"
            />
            <Button
              title="취소"
              onClick={handleCancelEdit}
              variant="outline"
              size="small"
            />
          </div>
        </div>
      ) : (
        <div className="comment-content">
          {comment.content}
        </div>
      )}

      <div className="comment-footer">
        <button
          className="like-button"
          onClick={() => onLikeComment(comment.id)}
        >
          👍 {formatNumber(comment.likes)}
        </button>
        {!isReply && (
          <button
            className="reply-button"
            onClick={() => handleReply(comment.id)}
          >
            💬 답글
          </button>
        )}
      </div>

      {replyingTo === comment.id && (
        <div className="reply-form">
          <textarea
            placeholder="답글을 작성하세요..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="reply-input"
            rows={2}
          />
          <div className="reply-actions">
            <Button
              title="답글 작성"
              onClick={handleSubmitReply}
              variant="primary"
              size="small"
            />
            <Button
              title="취소"
              onClick={handleCancelReply}
              variant="outline"
              size="small"
            />
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="comment-section">
      <h3 className="section-title">댓글 {comments.length}개</h3>

      <form className="comment-form" onSubmit={handleSubmitComment}>
        <textarea
          placeholder="댓글을 작성하세요..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-input"
          rows={3}
        />
        <Button
          title="댓글 작성"
          onClick={handleSubmitComment}
          variant="primary"
          size="small"
          className="comment-submit"
          disabled={!newComment.trim()}
        />
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>첫 번째 댓글을 작성해보세요!</p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};
