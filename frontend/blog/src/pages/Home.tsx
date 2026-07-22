import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlogPost from '../components/BlogPosts'

interface BlogPostsData {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: {
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HomeProps {
  onLogout: () => void;
  isAuthenticated: boolean;
}

export default function Home({ onLogout, isAuthenticated }: HomeProps) {
  const [posts, setPosts] = useState<BlogPostsData[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
          credentials: "include",
        });
        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Received Data : ", data);

          if (data && Array.isArray(data.posts)) {
            setPosts(data.posts);
          }
        } else {
          console.error("Failed to fetch posts:", response.statusText);
          setPosts([]);
        }
      } catch (error) {
        console.error("Error While Fetching the Post :", error);
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 w-full">
          <div className="flex justify-between items-center w-full sm:w-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Blog</h1>
            <button
              className="sm:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="block w-6 h-0.5 bg-white mb-1.5" />
              <span className="block w-6 h-0.5 bg-white mb-1.5" />
              <span className="block w-6 h-0.5 bg-white" />
            </button>
          </div>
          {isAuthenticated ? null : (
            <>
              <div className="hidden sm:flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                <a
                  href={`${import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5174"}`}
                  className="px-3 sm:px-4 py-2 bg-gray-900 text-[#FFD700] rounded-md outline-1 outline-[#FFD700] text-sm sm:text-base whitespace-nowrap text-center w-full sm:w-auto"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Become a writer
                </a>
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-md outline-1 outline-white text-sm sm:text-base whitespace-nowrap text-center w-full sm:w-auto"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-md outline-1 outline-white text-sm sm:text-base whitespace-nowrap text-center w-full sm:w-auto"
                >
                  Sign Up
                </Link>
              </div>

              {isMenuOpen && (
                <div className="sm:hidden w-full flex flex-col gap-2 bg-gray-800 p-4 rounded-md mt-2">
                  <a
                    href={`${import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5174"}`}
                    className="px-4 py-3 bg-gray-900 text-[#FFD700] rounded-md outline-1 outline-[#FFD700] text-center w-full"
                    onClick={() => setIsMenuOpen(false)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Become a writer
                  </a>
                  <Link
                    to="/login"
                    className="px-4 py-3 bg-gray-900 text-white rounded-md outline-1 outline-white text-center w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-3 bg-gray-900 text-white rounded-md outline-1 outline-white text-center w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6 mb-20">
          {posts.length > 0 ? (
            posts.map((post) => <BlogPost key={post.id} post={post} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No blog posts available at the moment.
              </p>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex justify-end mb-8">
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-white text-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
