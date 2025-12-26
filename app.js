// Instagram Clone - App JavaScript

// ==========================================
// SAMPLE DATA
// ==========================================

const stories = [
  { id: 1, username: 'your_story', avatar: 'https://i.pravatar.cc/150?img=3', isYours: true },
  { id: 2, username: 'travel_diary', avatar: 'https://i.pravatar.cc/150?img=11', hasStory: true },
  { id: 3, username: 'foodie_life', avatar: 'https://i.pravatar.cc/150?img=12', hasStory: true },
  { id: 4, username: 'fitness_guru', avatar: 'https://i.pravatar.cc/150?img=13', hasStory: true },
  { id: 5, username: 'music_vibes', avatar: 'https://i.pravatar.cc/150?img=14', hasStory: true },
  { id: 6, username: 'tech_weekly', avatar: 'https://i.pravatar.cc/150?img=15', hasStory: true },
  { id: 7, username: 'art_gallery', avatar: 'https://i.pravatar.cc/150?img=16', hasStory: true },
  { id: 8, username: 'nature_pics', avatar: 'https://i.pravatar.cc/150?img=17', hasStory: true },
];

const posts = [
  {
    id: 1,
    username: 'travel_diary',
    avatar: 'https://i.pravatar.cc/150?img=11',
    location: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=600&fit=crop',
    likes: 1234,
    caption: 'The city of lights never disappoints ✨🗼 #paris #travel #wanderlust',
    comments: 48,
    timeAgo: '2 hours ago'
  },
  {
    id: 2,
    username: 'foodie_life',
    avatar: 'https://i.pravatar.cc/150?img=12',
    location: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=600&fit=crop',
    likes: 856,
    caption: 'Authentic ramen experience 🍜 This was absolutely incredible!',
    comments: 32,
    timeAgo: '4 hours ago'
  },
  {
    id: 3,
    username: 'fitness_guru',
    avatar: 'https://i.pravatar.cc/150?img=13',
    location: 'Gold\'s Gym',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop',
    likes: 2103,
    caption: 'Push your limits! 💪 New personal record today. Consistency is key.',
    comments: 89,
    timeAgo: '6 hours ago'
  },
  {
    id: 4,
    username: 'nature_pics',
    avatar: 'https://i.pravatar.cc/150?img=17',
    location: 'Swiss Alps',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
    likes: 5678,
    caption: 'Mountains are calling and I must go 🏔️ #nature #mountains #adventure',
    comments: 156,
    timeAgo: '8 hours ago'
  },
  {
    id: 5,
    username: 'art_gallery',
    avatar: 'https://i.pravatar.cc/150?img=16',
    location: 'Modern Art Museum',
    image: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600&h=600&fit=crop',
    likes: 923,
    caption: 'Art speaks where words fail 🎨 #art #museum #creativity',
    comments: 41,
    timeAgo: '12 hours ago'
  }
];

const suggestions = [
  { id: 1, username: 'photography_pro', avatar: 'https://i.pravatar.cc/150?img=20', reason: 'Followed by travel_diary + 3 more' },
  { id: 2, username: 'coffee_lover', avatar: 'https://i.pravatar.cc/150?img=21', reason: 'Followed by foodie_life' },
  { id: 3, username: 'yoga_daily', avatar: 'https://i.pravatar.cc/150?img=22', reason: 'Suggested for you' },
  { id: 4, username: 'pet_paradise', avatar: 'https://i.pravatar.cc/150?img=23', reason: 'New to Instagram' },
  { id: 5, username: 'sunset_chaser', avatar: 'https://i.pravatar.cc/150?img=24', reason: 'Followed by nature_pics' },
];

// ==========================================
// DOM ELEMENTS
// ==========================================

const storyTray = document.getElementById('storyTray');
const postsContainer = document.getElementById('postsContainer');
const suggestionsContainer = document.getElementById('suggestionsContainer');

// ==========================================
// RENDER FUNCTIONS
// ==========================================

function renderStories() {
  if (!storyTray) return;
  
  storyTray.innerHTML = stories.map(story => `
    <div class="story-item" data-id="${story.id}">
      <div class="story-ring">
        <div class="story-ring-inner">
          <img src="${story.avatar}" alt="${story.username}" class="avatar story-avatar">
        </div>
      </div>
      <span class="story-username">${story.isYours ? 'Your story' : story.username}</span>
    </div>
  `).join('');
  
  // Add click handlers
  document.querySelectorAll('.story-item').forEach(item => {
    item.addEventListener('click', () => handleStoryClick(item.dataset.id));
  });
}

function renderPosts() {
  if (!postsContainer) return;
  
  postsContainer.innerHTML = posts.map(post => `
    <article class="post-card animate-slide-up" data-id="${post.id}">
      <!-- Header -->
      <header class="post-header">
        <div class="post-user">
          <img src="${post.avatar}" alt="${post.username}" class="avatar avatar-lg">
          <div class="post-user-info">
            <span class="post-username">${post.username}</span>
            ${post.location ? `<span class="post-location">${post.location}</span>` : ''}
          </div>
        </div>
        <button class="icon-btn" aria-label="More options">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="6" cy="12" r="1.5"/>
            <circle cx="18" cy="12" r="1.5"/>
          </svg>
        </button>
      </header>
      
      <!-- Image -->
      <img src="${post.image}" alt="Post by ${post.username}" class="post-image" loading="lazy">
      
      <!-- Actions -->
      <div class="post-actions">
        <div class="post-actions-left">
          <button class="action-btn like-btn" data-id="${post.id}" aria-label="Like">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="action-btn" aria-label="Comment">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </button>
          <button class="action-btn" aria-label="Share">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 2 11 13"/>
              <path d="m22 2-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
        <button class="action-btn save-btn" data-id="${post.id}" aria-label="Save">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
      
      <!-- Likes -->
      <div class="post-likes">
        <span class="likes-count" data-id="${post.id}">${formatNumber(post.likes)}</span> likes
      </div>
      
      <!-- Caption -->
      <div class="post-caption">
        <span class="post-caption-username">${post.username}</span>
        ${post.caption}
      </div>
      
      <!-- Comments Link -->
      <div class="post-comments-link">
        View all ${post.comments} comments
      </div>
      
      <!-- Time -->
      <div class="post-time">${post.timeAgo}</div>
      
      <!-- Add Comment -->
      <div class="post-add-comment">
        <span style="font-size: 20px; cursor: pointer;">😊</span>
        <input type="text" class="post-comment-input" placeholder="Add a comment..." data-id="${post.id}">
        <button class="post-btn" data-id="${post.id}">Post</button>
      </div>
    </article>
  `).join('');
  
  // Add event listeners
  addPostEventListeners();
}

function renderSuggestions() {
  if (!suggestionsContainer) return;
  
  suggestionsContainer.innerHTML = suggestions.map(suggestion => `
    <div class="suggestion-item" data-id="${suggestion.id}">
      <img src="${suggestion.avatar}" alt="${suggestion.username}" class="avatar avatar-lg">
      <div class="suggestion-info">
        <span class="suggestion-username">${suggestion.username}</span>
        <span class="suggestion-reason">${suggestion.reason}</span>
      </div>
      <button class="suggestion-follow" data-id="${suggestion.id}">Follow</button>
    </div>
  `).join('');
  
  // Add follow button handlers
  document.querySelectorAll('.suggestion-follow').forEach(btn => {
    btn.addEventListener('click', (e) => handleFollow(e, btn.dataset.id));
  });
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function addPostEventListeners() {
  // Like buttons
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => handleLike(btn));
  });
  
  // Save buttons
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', () => handleSave(btn));
  });
  
  // Comment inputs
  document.querySelectorAll('.post-comment-input').forEach(input => {
    const postBtn = input.nextElementSibling;
    
    input.addEventListener('input', () => {
      if (input.value.trim().length > 0) {
        postBtn.classList.add('active');
      } else {
        postBtn.classList.remove('active');
      }
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim().length > 0) {
        handlePostComment(input);
      }
    });
    
    postBtn.addEventListener('click', () => {
      if (input.value.trim().length > 0) {
        handlePostComment(input);
      }
    });
  });
  
  // Double-click to like image
  document.querySelectorAll('.post-image').forEach(img => {
    img.addEventListener('dblclick', (e) => {
      const postCard = e.target.closest('.post-card');
      const likeBtn = postCard.querySelector('.like-btn');
      if (!likeBtn.classList.contains('liked')) {
        handleLike(likeBtn);
        showHeartAnimation(e);
      }
    });
  });
}

function handleStoryClick(storyId) {
  const story = stories.find(s => s.id === parseInt(storyId));
  if (story) {
    console.log(`Viewing story from ${story.username}`);
    // In a real app, this would open the story viewer
  }
}

function handleLike(btn) {
  const postId = btn.dataset.id;
  const likesSpan = document.querySelector(`.likes-count[data-id="${postId}"]`);
  const post = posts.find(p => p.id === parseInt(postId));
  
  if (btn.classList.contains('liked')) {
    btn.classList.remove('liked');
    post.likes--;
  } else {
    btn.classList.add('liked');
    btn.classList.add('animate-heart');
    post.likes++;
    
    // Remove animation class after it completes
    setTimeout(() => {
      btn.classList.remove('animate-heart');
    }, 500);
  }
  
  likesSpan.textContent = formatNumber(post.likes);
}

function handleSave(btn) {
  if (btn.classList.contains('saved')) {
    btn.classList.remove('saved');
  } else {
    btn.classList.add('saved');
  }
}

function handlePostComment(input) {
  const comment = input.value.trim();
  const postId = input.dataset.id;
  
  console.log(`Comment on post ${postId}: ${comment}`);
  
  // Clear input
  input.value = '';
  input.nextElementSibling.classList.remove('active');
  
  // Show feedback
  showToast('Comment posted!');
}

function handleFollow(e, suggestionId) {
  const btn = e.target;
  
  if (btn.textContent === 'Follow') {
    btn.textContent = 'Following';
    btn.style.color = 'var(--ig-text-secondary)';
  } else {
    btn.textContent = 'Follow';
    btn.style.color = 'var(--ig-primary-blue)';
  }
}

function showHeartAnimation(e) {
  const heart = document.createElement('div');
  heart.innerHTML = `
    <svg width="80" height="80" viewBox="0 0 24 24" fill="white" stroke="none" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  `;
  heart.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0);
    pointer-events: none;
    animation: heartPopup 0.8s ease forwards;
  `;
  
  const postImage = e.target;
  postImage.style.position = 'relative';
  postImage.parentElement.style.position = 'relative';
  postImage.parentElement.appendChild(heart);
  
  setTimeout(() => {
    heart.remove();
  }, 800);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--ig-text-primary);
    color: var(--ig-bg-primary);
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ==========================================
// CSS ANIMATION INJECTION
// ==========================================

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes heartPopup {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  renderStories();
  renderPosts();
  renderSuggestions();
});
