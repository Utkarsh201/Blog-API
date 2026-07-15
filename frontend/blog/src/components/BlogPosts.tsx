import {useNavigate} from 'react-router-dom'

interface BlogPostData{
    id : string,
    title : string,
    content : string,
    published : boolean,
    author : {
        username : string
    },
    createdAt : string,
    updatedAt : string
}

interface BlogPostProps {
    post : BlogPostData
}

export default function BlogPost({post} : BlogPostProps){
    const navigate = useNavigate();
    const formatDate = (dateString : string) =>{
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <article className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 shadow-lg">
        <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-2 hover:text-blue-400 transition-colors cursor-pointer" onClick={() => navigate(`/posts/${post.id}`)}>
            {post.title}
            </h2>
            <div className="flex items-center text-sm text-gray-400 space-x-4">
            <span>By {post.author.username}</span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
            </div>
        </div>

        <div className="text-gray-300 leading-relaxed mb-4">
            <p className="line-clamp-3">
            {post.content.length > 200
                ? `${post.content.substring(0, 200)}...`
                : post.content}
            </p>
        </div>

        <div className="flex items-center justify-end">
            <button
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
            onClick={() => navigate(`/posts/${post.id}`)}
            >
            Read More
            </button>
        </div>
        </article>
    );
}