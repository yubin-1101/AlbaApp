import React, { useState } from 'react';
import './PostList.css';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
}

interface PostListProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onCategoryFilter: (category: string) => void;
  onSearch: (query: string) => void;
}

const POST_CATEGORIES = [
  '전체',
  '근무 팁',
  '매장 정보',
  '불만사항',
  '알바 정보',
  '일상',
  '기타',
];

export const PostList: React.FC<PostListProps> = ({
  posts,
  onPostClick,
  onCategoryFilter,
  onSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest');

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onCategoryFilter(category === '전체' ? '' : category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSortChange = (sortType: 'latest' | 'popular' | 'views') => {
    setSortBy(sortType);
  };

  const getSortedPosts = () => {
    const filteredPosts = selectedCategory === '전체' 
      ? posts 
      : posts.filter(post => post.category === selectedCategory);

    switch (sortBy) {
      case 'latest':
        return filteredPosts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'popular':
        return filteredPosts.sort((a, b) => b.likes - a.likes);
      case 'views':
        return filteredPosts.sort((a, b) => b.views - a.views);
      default:
        return filteredPosts;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}일 전`;
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

  const sortedPosts = getSortedPosts();

  return (
    <div className="post-list">
      <div className="list-header">
        <h3 className="list-title">커뮤니티</h3>
        
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="게시글 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            검색
          </button>
        </form>
      </div>

      <div className="category-filter">
        {POST_CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="sort-controls">
        <span className="sort-label">정렬:</span>
        <button
          className={`sort-button ${sortBy === 'latest' ? 'active' : ''}`}
          onClick={() => handleSortChange('latest')}
        >
          최신순
        </button>
        <button
          className={`sort-button ${sortBy === 'popular' ? 'active' : ''}`}
          onClick={() => handleSortChange('popular')}
        >
          인기순
        </button>
        <button
          className={`sort-button ${sortBy === 'views' ? 'active' : ''}`}
          onClick={() => handleSortChange('views')}
        >
          조회순
        </button>
      </div>

      <div className="posts-container">
        {sortedPosts.length === 0 ? (
          <div className="no-posts">
            <p>게시글이 없습니다.</p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <div
              key={post.id}
              className="post-item"
              onClick={() => onPostClick(post)}
            >
              <div className="post-header">
                <div className="post-category">{post.category}</div>
                <div className="post-meta">
                  <span className="post-author">{post.author}</span>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>
              </div>

              <div className="post-content">
                <h4 className="post-title">{post.title}</h4>
                <p className="post-excerpt">
                  {post.content.length > 100 
                    ? `${post.content.substring(0, 100)}...` 
                    : post.content
                  }
                </p>
              </div>

              <div className="post-stats">
                <div className="stat-item">
                  <span className="stat-icon">👍</span>
                  <span className="stat-value">{formatNumber(post.likes)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💬</span>
                  <span className="stat-value">{formatNumber(post.comments)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">👁️</span>
                  <span className="stat-value">{formatNumber(post.views)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
