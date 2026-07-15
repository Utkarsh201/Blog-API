import React , {useState} from 'react'

interface Comment {
    id : string,
    content : string,
    author : {
        username : string
    },
    createdAt : string,
    updatedAt : string
}

interface CommentsSectionProps{
    comments : Comment[],
    onAddComment : (content : string) => Promise<void>;
    currentUser : {username : string} | null;
    isAuthenticated : boolean;
}

export default function CommentsSection({comments, onAddComment, isAuthenticated}:CommentsSectionProps){
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        if(!newComment.trim() || !isAuthenticated){
            return ;
        }
        setIsSubmitting(true);
        try {
            await onAddComment(newComment);
            setNewComment('');
        } catch (error) {
            console.error('Failed to Post Comment : ', error);

        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Comments ({comments.length})</h2>
        
        {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="mb-6">
            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border rounded bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none min-h-[120px] max-h-[200px] overflow-y-auto"
                rows={3}
                disabled={isSubmitting}
                style={{ resize: 'none' }}
            />
            <div className="flex justify-end">
                <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
            </div>
            </form>
        ) : (
            <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
            <p className="text-gray-300">
                <a 
                href="/login" 
                className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                >
                Sign in
                </a>{' '}
                to leave a comment.
            </p>
            </div>
        )}

        <div className="space-y-4">
            {comments.length === 0 ? (
            <p className="text-gray-400 italic">No comments yet. Be the first to comment!</p>
            ) : (
            [...comments]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((comment) => (
                <div key={comment.id} className="p-4 border border-gray-700 rounded-lg bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold">{comment.author.username}</span>
                    <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toISOString().split('T')[0]}
                    </span>
                </div>
                <p className="text-gray-200">{comment.content}</p>
                </div>
            ))
            )}
        </div>
        </div>
    );
}