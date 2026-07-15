import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export default function CreateBlog(){
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();

        if(!title.trim() || !content.trim()){
            setError('Please fill all the fields');  
            return ;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token') || localStorage.getItems('adminToken');

            if(!token){
                throw new Error('No authentication token found pls login again');
            }

            const apiUrl = `${import.meta.env.VITE_API_URL || ''}/posts`;
            console.log('Making Request to : ', apiUrl);

            const response = await fetch(apiUrl, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${token}`
                },
                body : JSON.stringify({
                    title : title.trim(),
                    cotent : content.trim(),
                    published : true
                }),
                credentials : 'include'
            })

            // this line is used to prevent the programming from crashing if the server sends back invalid response
            const responseData = await response.json().catch(()=> ({}));

            if(!response.ok){
                console.error('API error Resonse :' , {
                    status : response.status,
                    statusText : response.statusText,
                    data : responseData
                });

                let errorMessage = 'Failed to create blog post';
                if (responseData.error) {
                    errorMessage = responseData.error;
                } else if (response.status === 401) {
                    errorMessage = 'Session expired. Please log in again.';
                } else if (response.status === 400) {
                    errorMessage = 'Invalid data. Please check your input.';
                } else if (response.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                }

                throw new Error(errorMessage);
            }

            navigate('/dashboard');

        } catch (error) {
            console.error('Error while creating a Blog Post : ', error);
            setError(error instanceof Error ? error.message : 'An error occured while creating a blog post');
        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-white">Create New Blog Post</h1>
        
        {error && (
            <p className="text-red-500 text-sm mb-4">
            {error}
            </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Title
            </label>
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter blog title"
                disabled={isSubmitting}
            />
            </div>

            <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
                Content
            </label>
            <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white h-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your blog content here..."
                disabled={isSubmitting}
            />
            </div>

            <div className="flex justify-end mt-6">
            <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
            </div>
        </form>
        </div>
        </div>
    );

}