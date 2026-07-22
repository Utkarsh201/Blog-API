import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CommentsSection from "../components/CommentsSection";

interface User {
  id: string;
  username: string;
  email: string;
}

interface Comments {
  id: string;
  content: string;
  author: {
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BlogPostsData {
  id: string;
  content: string;
  title: string;
  published: boolean;
  author: {
    username: string;
  };
  comments: Comments[];
  createdAt: string;
  updatedAt: string;
}

interface PostPageProps {
  isAuthenticated: boolean;
}

export default function PostPage({ isAuthenticated }: PostPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("Post Page - current user changed : ", currentUser);
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    const fullUrl = url.startsWith("http")
      ? url
      : `${baseUrl.replace(/\/$/, "")}/${cleanUrl}`;

    const token = localStorage.getItem("token");
    console.log("Using token:", token ? "Token found" : "No token");

    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }

    if (token && !headers.has("Authorization")) {
      headers.append("Authorization", `Bearer ${token}`);
    }

    console.log("Making Request to : ", fullUrl);
    console.log("Headers :", Object.fromEntries(headers.entries()));

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: "include",
      });
      console.log("Response Status : ", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Request failed : ", {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          response: errorText,
        });
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`,
        );
      }
      return response;
    } catch (error) {
      console.log("Fetch Error", error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Current token:", token || "No token found");

        try {
          const userResponse = await fetchWithAuth("/users/profile");
          console.log("Profile response status:", userResponse.status);
          if (userResponse.ok) {
            const data = await userResponse.json();
            console.log("User data received :", data);
            setCurrentUser(data.user || data);
          } else {
            console.error(
              "Failed to fetch user profile:",
              userResponse.status,
              userResponse.statusText,
            );
            setCurrentUser(null);
          }
        } catch (useError) {
          console.error("Error fetching user data:", useError);
          setCurrentUser(null);
        }

        const postResponse = await fetchWithAuth(`/posts/${id}`);

        if (!postResponse) {
          setError("Post Not Found");
          setLoading(false);
          return;
        }

        const postData = await postResponse.json();
        setPost(postData);
      } catch (error) {
        console.error("Error Fetching Posts :", error);
        setError("Network error please try again later");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleAddComment = async (content: string) => {
    console.log("handleAddComment called with content:", content);

    if (!currentUser) {
      const error = "Cannot post comment: No current user";
      console.error(error);
      throw new Error("You must be logged in to post a comment");
    }

    if (!id) {
      const error = "Cannot post comment: No post ID";
      console.error(error);
      throw new Error("No post ID found");
    }

    console.log("Posting comment with:", {
      content,
      postId: id,
      currentUser: currentUser.username,
    });


    try {
        const response = await fetchWithAuth(`/posts/${id}/comments`, {
            method : 'POST',
            body : JSON.stringify({content}), 
        })

        console.log('Response Status :', response.status);

        if(!response.ok){
            let errorData;
            try {
                errorData = await response.json();
                console.error('Error response from server:', errorData);
            } catch (error) {
                console.error('Failed to parse error response:', error);
                errorData = { error: 'Failed to add comment' };
            }
            throw new Error(errorData.error || `Failed to add comment: ${response.status} ${response.statusText}`);
        }

        let newComment;
        try {
          newComment = await response.json();
          console.log('Comment created Sucessfully : ', newComment);

        } catch (error) {
          console.error('Failed to parse Sucessfull response :', error);
          throw new Error('Failed to parse server Response', {cause : error});
        }

        setPost(prevPost => {
          if (!prevPost) return null;
          return {
            ...prevPost,
            comments: [...prevPost.comments, newComment]
          };
        });

        return newComment;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 sm:px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 sm:px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-red-400">Post not found</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-gray-900 px-4 sm:px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{error || 'Post not found'}</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 px-4 sm:px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white text-lg font-medium cursor-pointer"
          >
            &larr; Back to blog
          </button>
          {!isAuthenticated && (
            <div className="space-x-4">
              <a
                href="/login"
                className="px-4 py-2 bg-gray-900 text-white rounded-md outline-1 outline-white"
              >
                Login
              </a>
              <a
                href="/signup"
                className="px-4 py-2 bg-gray-900 text-white rounded-md outline-1 outline-white"
              >
                Sign Up
              </a>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <article className="mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
            <div className="flex items-center text-gray-400 text-sm mb-6">
              <span>By {post.author.username}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-line text-white">{post.content}</p>
            </div>
          </article>

          <section className="border-t border-gray-800 pt-8">
            <CommentsSection
              comments={post.comments || []}
              onAddComment={handleAddComment}
              currentUser={currentUser}
              isAuthenticated={isAuthenticated}
            />
          </section>

          {isAuthenticated && (
            <div className="flex justify-end mb-8 mt-20">
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
