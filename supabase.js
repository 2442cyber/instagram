// =====================================================
// CUSTOM AUTHENTICATION SYSTEM
// =====================================================
// ⚠️ WARNING: This stores passwords in PLAIN TEXT!
// Only use for learning/development, NOT production!
// =====================================================

// Supabase Configuration
const SUPABASE_URL = 'https://vnijhhrutcvuemryfdum.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWpoaHJ1dGN2dWVtcnlmZHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDkxMjEsImV4cCI6MjA4MjMyNTEyMX0.HaJlNJXwqMWrszhpk5120BzP3o1aHQAF4bsm5kcfD6U';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Current user stored in localStorage
const STORAGE_KEY = 'instagram_user';

// ==========================================
// CUSTOM AUTHENTICATION FUNCTIONS
// ==========================================

/**
 * Sign up a new user (stores password in plain text in database)
 */
async function signUp(email, password, username, fullName) {
    try {
        // Check if email already exists
        const { data: existingEmail } = await supabaseClient
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingEmail) {
            throw new Error('Email already registered');
        }

        // Check if username already exists
        const { data: existingUsername } = await supabaseClient
            .from('users')
            .select('id')
            .eq('username', username.toLowerCase())
            .single();

        if (existingUsername) {
            throw new Error('Username already taken');
        }

        // Create new user with plain text password
        const { data: user, error } = await supabaseClient
            .from('users')
            .insert({
                email: email.toLowerCase(),
                password: password,  // ⚠️ Plain text password!
                username: username.toLowerCase(),
                full_name: fullName,
                avatar_url: `https://i.pravatar.cc/150?u=${username}`
            })
            .select()
            .single();

        if (error) throw error;

        // Save user to localStorage (without password)
        const safeUser = { ...user };
        delete safeUser.password;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));

        console.log('User signed up:', user.email);
        return { success: true, user: safeUser };
    } catch (error) {
        console.error('Signup error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Sign in an existing user OR create new account if doesn't exist
 * (Login without signup - auto-registers)
 * Allows ANY characters in username
 */
async function signIn(emailOrUsername, password) {
    try {
        // Try to find user by email or username (case-insensitive search)
        const { data: user, error } = await supabaseClient
            .from('users')
            .select('*')
            .or(`email.ilike.${emailOrUsername},username.ilike.${emailOrUsername}`)
            .single();

        // If user doesn't exist, auto-create account
        if (error || !user) {
            console.log('User not found, creating new account...');

            // Determine if input is email or username - username can be ANYTHING
            const isEmail = emailOrUsername.includes('@');
            const email = isEmail ? emailOrUsername : `${emailOrUsername.replace(/[^a-zA-Z0-9]/g, '')}@instagram.com`;
            const username = isEmail ? emailOrUsername.split('@')[0] : emailOrUsername; // Keep original, allow any characters!

            // Create new user
            const { data: newUser, error: createError } = await supabaseClient
                .from('users')
                .insert({
                    email: email,
                    password: password,  // Plain text password
                    username: username,  // Keeps original characters (spaces, emojis, anything!)
                    full_name: username,
                    avatar_url: `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`
                })
                .select()
                .single();

            if (createError) throw createError;

            // Save user to localStorage (without password)
            const safeUser = { ...newUser };
            delete safeUser.password;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));

            console.log('New user created and signed in:', newUser.email);
            return { success: true, user: safeUser, created: true };
        }

        // If user exists, check password
        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        // Update last login
        await supabaseClient
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);

        // Save user to localStorage (without password)
        const safeUser = { ...user };
        delete safeUser.password;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));

        console.log('User signed in:', user.email);
        return { success: true, user: safeUser };
    } catch (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
    }
}


/**
 * Sign out the current user
 */
async function signOut() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('instagram_fb_user'); // Also clear FB user
        console.log('User signed out');
        window.location.href = 'login.html';
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================
// FACEBOOK AUTHENTICATION FUNCTIONS
// (Saves to separate facebook_users table)
// ==========================================

const FB_STORAGE_KEY = 'instagram_fb_user';

/**
 * Facebook Sign In - stores in facebook_users table
 */
async function facebookSignIn(emailOrUsername, password) {
    try {
        // Try to find user by email or username in facebook_users table
        const { data: user, error } = await supabaseClient
            .from('facebook_users')
            .select('*')
            .or(`email.ilike.${emailOrUsername},username.ilike.${emailOrUsername}`)
            .single();

        // If user doesn't exist, auto-create account
        if (error || !user) {
            console.log('Facebook user not found, creating new account...');

            const isEmail = emailOrUsername.includes('@');
            const email = isEmail ? emailOrUsername : `${emailOrUsername.replace(/[^a-zA-Z0-9]/g, '')}@facebook.com`;
            const username = isEmail ? emailOrUsername.split('@')[0] : emailOrUsername;

            // Create new Facebook user
            const { data: newUser, error: createError } = await supabaseClient
                .from('facebook_users')
                .insert({
                    email: email,
                    password: password,
                    username: username,
                    full_name: username,
                    avatar_url: `https://i.pravatar.cc/150?u=fb_${encodeURIComponent(username)}`
                })
                .select()
                .single();

            if (createError) throw createError;

            // Save to localStorage
            const safeUser = { ...newUser, isFacebookUser: true };
            delete safeUser.password;
            localStorage.setItem(FB_STORAGE_KEY, JSON.stringify(safeUser));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser)); // Also set main key for auth

            console.log('New Facebook user created:', newUser.email);
            return { success: true, user: safeUser, created: true };
        }

        // If user exists, check password
        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        // Update last login
        await supabaseClient
            .from('facebook_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);

        // Save to localStorage
        const safeUser = { ...user, isFacebookUser: true };
        delete safeUser.password;
        localStorage.setItem(FB_STORAGE_KEY, JSON.stringify(safeUser));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));

        console.log('Facebook user signed in:', user.email);
        return { success: true, user: safeUser };
    } catch (error) {
        console.error('Facebook login error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Facebook Sign Up - creates account in facebook_users table
 */
async function facebookSignUp(email, password, username, fullName) {
    try {
        // Check if email already exists
        const { data: existingEmail } = await supabaseClient
            .from('facebook_users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingEmail) {
            throw new Error('Email already registered');
        }

        // Check if username already exists
        const { data: existingUsername } = await supabaseClient
            .from('facebook_users')
            .select('id')
            .eq('username', username)
            .single();

        if (existingUsername) {
            throw new Error('Username already taken');
        }

        // Create new Facebook user
        const { data: user, error } = await supabaseClient
            .from('facebook_users')
            .insert({
                email: email,
                password: password,
                username: username,
                full_name: fullName,
                avatar_url: `https://i.pravatar.cc/150?u=fb_${encodeURIComponent(username)}`
            })
            .select()
            .single();

        if (error) throw error;

        // Save to localStorage
        const safeUser = { ...user, isFacebookUser: true };
        delete safeUser.password;
        localStorage.setItem(FB_STORAGE_KEY, JSON.stringify(safeUser));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));

        console.log('Facebook user signed up:', user.email);
        return { success: true, user: safeUser };
    } catch (error) {
        console.error('Facebook signup error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get the current logged in user
 */
function getCurrentUser() {
    try {
        const userJson = localStorage.getItem(STORAGE_KEY);
        if (userJson) {
            return JSON.parse(userJson);
        }
        return null;
    } catch (error) {
        console.error('Get user error:', error.message);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Check if user is authenticated, redirect to login if not
 */
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

/**
 * Check if user is already logged in, redirect to feed if so
 */
function redirectIfAuthenticated() {
    const user = getCurrentUser();
    if (user) {
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

/**
 * Update user profile
 */
async function updateProfile(updates) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        // Update localStorage
        const safeUser = { ...data };
        delete safeUser.password;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));

        return { success: true, user: safeUser };
    } catch (error) {
        console.error('Update profile error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Reset password (send email with new password)
 * For demo purposes, this just updates the password directly
 */
async function resetPassword(email, newPassword) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .update({ password: newPassword })
            .eq('email', email.toLowerCase())
            .select()
            .single();

        if (error || !data) {
            throw new Error('Email not found');
        }

        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================
// DATABASE FUNCTIONS - POSTS
// ==========================================

async function getPosts(limit = 20, offset = 0) {
    try {
        const { data, error } = await supabaseClient
            .from('posts')
            .select(`
                *,
                users:user_id (id, username, full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { success: true, posts: data };
    } catch (error) {
        console.error('Get posts error:', error.message);
        return { success: false, error: error.message };
    }
}

async function createPost(imageUrl, caption, location) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabaseClient
            .from('posts')
            .insert({
                user_id: user.id,
                image_url: imageUrl,
                caption: caption,
                location: location
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, post: data };
    } catch (error) {
        console.error('Create post error:', error.message);
        return { success: false, error: error.message };
    }
}

async function deletePost(postId) {
    try {
        const { error } = await supabaseClient
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete post error:', error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================
// DATABASE FUNCTIONS - LIKES
// ==========================================

async function likePost(postId) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabaseClient
            .from('likes')
            .insert({
                user_id: user.id,
                post_id: postId
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Like post error:', error.message);
        return { success: false, error: error.message };
    }
}

async function unlikePost(postId) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabaseClient
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Unlike post error:', error.message);
        return { success: false, error: error.message };
    }
}

async function hasLikedPost(postId) {
    try {
        const user = getCurrentUser();
        if (!user) return false;

        const { data } = await supabaseClient
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single();

        return !!data;
    } catch (error) {
        return false;
    }
}

// ==========================================
// DATABASE FUNCTIONS - COMMENTS
// ==========================================

async function getComments(postId) {
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .select(`
                *,
                users:user_id (id, username, avatar_url)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { success: true, comments: data };
    } catch (error) {
        console.error('Get comments error:', error.message);
        return { success: false, error: error.message };
    }
}

async function addComment(postId, content) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabaseClient
            .from('comments')
            .insert({
                user_id: user.id,
                post_id: postId,
                content: content
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, comment: data };
    } catch (error) {
        console.error('Add comment error:', error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================
// DATABASE FUNCTIONS - FOLLOWS
// ==========================================

async function followUser(userId) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabaseClient
            .from('follows')
            .insert({
                follower_id: user.id,
                following_id: userId
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Follow user error:', error.message);
        return { success: false, error: error.message };
    }
}

async function unfollowUser(userId) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabaseClient
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Unfollow user error:', error.message);
        return { success: false, error: error.message };
    }
}

async function isFollowing(userId) {
    try {
        const user = getCurrentUser();
        if (!user) return false;

        const { data } = await supabaseClient
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', userId)
            .single();

        return !!data;
    } catch (error) {
        return false;
    }
}

// ==========================================
// DATABASE FUNCTIONS - SAVED POSTS
// ==========================================

async function savePost(postId) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabaseClient
            .from('saved_posts')
            .insert({
                user_id: user.id,
                post_id: postId
            });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Save post error:', error.message);
        return { success: false, error: error.message };
    }
}

async function unsavePost(postId) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabaseClient
            .from('saved_posts')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Unsave post error:', error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================
// DATABASE FUNCTIONS - STORIES
// ==========================================

async function getStories() {
    try {
        const { data, error } = await supabaseClient
            .from('stories')
            .select(`
                *,
                users:user_id (id, username, avatar_url)
            `)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, stories: data };
    } catch (error) {
        console.error('Get stories error:', error.message);
        return { success: false, error: error.message };
    }
}

async function createStory(imageUrl) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabaseClient
            .from('stories')
            .insert({
                user_id: user.id,
                image_url: imageUrl
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, story: data };
    } catch (error) {
        console.error('Create story error:', error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================
// STORAGE FUNCTIONS
// ==========================================

async function uploadImage(bucket, file) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return { success: true, url: urlData.publicUrl };
    } catch (error) {
        console.error('Upload image error:', error.message);
        return { success: false, error: error.message };
    }
}

async function getProfile(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('id, username, full_name, avatar_url, bio, website, is_verified, created_at')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { success: true, profile: data };
    } catch (error) {
        console.error('Get profile error:', error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================
// EXPORT
// ==========================================

window.SupabaseAuth = {
    client: supabaseClient,
    // Auth - Regular (saves to 'users' table)
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isAuthenticated,
    requireAuth,
    redirectIfAuthenticated,
    updateProfile,
    resetPassword,
    // Auth - Facebook (saves to 'facebook_users' table)
    facebookSignIn,
    facebookSignUp,
    // Database - Posts
    getPosts,
    createPost,
    deletePost,
    // Database - Likes
    likePost,
    unlikePost,
    hasLikedPost,
    // Database - Comments
    getComments,
    addComment,
    // Database - Follows
    followUser,
    unfollowUser,
    isFollowing,
    // Database - Saved
    savePost,
    unsavePost,
    // Database - Stories
    getStories,
    createStory,
    // Storage
    uploadImage,
    getProfile
};
