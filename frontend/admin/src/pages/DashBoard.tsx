import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom'




export default function DashBoard(){
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    interface BlogPost {
        id : string,
        title : string,
        content : string,
        published : boolean,
        authorId : string,
        createdAt : string,
        updatedAt : string,
        author?:{
            id : string,
            username : string,
            email : string
        };
    }

    const [blogs, setBlogs] = useState<BlogPost[]>([]);

    useEffect(()=>{
        const fetchBlogs = async () => {
            try {
                let token = localStorage.getItem('token') || localStorage.getItem('adminToken');

                if(!token){
                    console.error('No authentication Error found');
                    return ;
                }

                console.log('Making request to', `${import.meta.env.VITE_API_URL || ''}/posts`);
                console.log('Using token :', token ? 'Token exists' : 'No token');

                const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/posts/admin`, {
                    method : 'GET',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Authorization' : `Bearer ${token}`
                    },
                    credentials : 'include'
                });

                console.log('Response status', response.status);

                const responseClone = response.clone();

                if (!response.ok) {
                    try {
                        const errorData = await response.json();
                        console.error('Error response data:', errorData);
                        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                    } catch (e) {
                        console.error('Could not parse error response as JSON, trying text...');
                        const text = await responseClone.text();
                        console.error('Raw error response:', text);
                        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                    }
                }

                try {
                    const data = response.json();
                    console.log('Fetched Blog Data : ', data);
                    setBlogs(Array.isArray(data) ? data : (data.posts || []));
                } catch (error) {
                    console.error('Failed to parse response as JSON');
                    const text = await responseClone.text();
                    console.error('Raw response:', text);
                    throw new Error('Failed to parse response as JSON');
                }
            } catch (error) {
                console.error('Error in fetchBlogs:', {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    name: error instanceof Error ? error.name : 'UnknownError',
                    stack: error instanceof Error ? error.stack : undefined
                });
            }
        };

        fetchBlogs();
    }, []); 


    const handleDelete = async (blogId : string) => {
        if(!window.confirm('Are you sure you want to delete the blog')){
            return ;
        }
        setBlogs(blogs.filter(blog => blog.id != blogId));
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/posts/${blogId}`, {
                method : 'DELETE',
                headers : {
                    'Authorizatoin' : `Bearer ${token}`,
                    'Content-Type' : 'application/json'
                },
                credentials : 'include'
            });

            if(!response.ok){
                throw new Error('Failed to delete the POST');
            }
        } catch (error) {
            console.error('Error Deleting post : ', error);
            alert('Failed to delete the POST');
        }
    };


    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('adminToken');

            const response = await fetch(`${import.meta.env.VITE_API_URL} || ''/admin/logout`, {
                method : 'POST',
                headers : {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type' : 'application/json' 
                },
                credentials : 'include'
            })

            if(!response.ok){
                throw new Error('Logout Failed');   
            }

            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';

        } catch (error) {
            console.error('Logout error : ', error);
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <Link 
                to="/create-blog"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer"
            >
                Write
            </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.length > 0 ? (
                blogs.map((blog) => (
                <div key={blog.id} className="bg-gray-800 text-white rounded-lg shadow-md p-6 relative group">
                    <h2 className="text-xl font-bold mb-2 pr-6">{blog.title}</h2>
                    <button
                    onClick={() => handleDelete(blog.id)}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700 transition-colors"
                    title="Delete post"
                    >
                    <img 
                        src={deleteIcon} 
                        alt="Delete" 
                        className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100"
                    />
                    </button>
                </div>
                ))
            ) : (
                <div className="col-span-3 text-center py-8">
                <p className="text-gray-400">No blogs found. Create your first blog post!</p>
                </div>
            )}
            </div>
            <div className="mt-8 pt-4 flex justify-end">
            <button
                onClick={handleLogout}
                className={`text-sm text-gray-400 hover:text-white cursor-pointer ${isLoggingOut ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
            </div>
        </div>
        </div>
    );


}

