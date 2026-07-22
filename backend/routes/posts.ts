import express, {Request, Response, NextFunction, RequestHandler} from "express";
import passport from "passport"
import prisma from "../prisma/client.js"
import {isAdmin} from "../middleware/auth.js"

const authenticateAdmin : RequestHandler = (req : Request, res : Response, next : NextFunction)=>{
    const auth = passport.authenticate('jwt', {session : false}, (err : Error | null, user?:Express.User)=>{
        if(err){
            return next(err)
        }
        if(!user){
            return res.status(400).json({
                error : "Unauthorized"
            })
        }
        req.user = user;
        return next();
    });

    return auth(req, res, next);
}

const router = express.Router();

router.get('/', async (_req, res)=>{
    try {
        const posts = await prisma.post.findMany({
            where : {
                published : true,
            },
            include : {
                author : {
                    select : {
                        id : true,
                        username : true,
                        email : true
                    }
                }
            },
            orderBy : {
                createdAt : 'desc'
            }
        });
        return res.json({posts});
    } catch (error) {
        console.error("Error while fetching the post :", error);
        return res.status(500).json({
            error : "Error while fetching the post"
        })
    }
})

router.get('/admin', authenticateAdmin, isAdmin,  async (req, res)=>{
    try {
        const posts = await prisma.post.findMany({
            where : {
                authorId : req.user!.id
            },
            include : {
                author : {
                    select : {
                        id : true,
                        username : true,
                        email : true
                    }
                }
            },
            orderBy : {
                createdAt : 'desc'
            }
        });

        return res.json({posts});
    } catch (error) {
        console.error("Error Fectching Admin Post :", error);
        return res.status(500).json({
            error : 'Failed to fetch posts'
        })
    }
})


router.get('/:id', async (req, res)=>{
    const {id} = req.params;
    try {
        const post = await prisma.post.findUnique({
            where : {id : id as string},
            include : {
                author : true,
                comments : {
                    include : {
                        author : {
                            select : {
                                id : true,
                                username : true,
                                email : true
                            }
                        }
                    },
                    orderBy : {
                        createdAt : 'desc'
                    }
                }
            }
        });

        if(!post){
            res.status(404).json({
                error : 'Post Not found'
            });
            return ;
        }
        return res.json(post)
    } catch (error) {
        console.error("Error Fetching Post");
        return res.status(500).json({
            error : 'Failed to fetch post'
        })
    }
})

router.post('/', passport.authenticate('jwt', {session : false}), isAdmin, async (req, res)=>{
    const {title , content} = req.body;
    const authorId = req.user?.id;

    console.log("Creating post with : ", {title, content, authorId});

    if(!authorId){
        return res.status(400).json({
            error : 'user not authenticated'
        })
    }

    if(!title || !content){
        return res.status(400).json({
            error : "Title and the content are required"
        })
    }

    try {
        const post = await prisma.post.create({
            data : {
                title : String(title),
                content : String(content),
                authorId : String(authorId),
                published : true,
            },
            include : {
                author : {
                    select : {
                        id : true,
                        username : true,
                        email : true
                    }
                }
            }
        });
        return res.status(201).json({
            post
        })
    } catch (error) {
        console.error("Error while creating posts : ", error);
        if(error && typeof error === 'object' && 'code' in error){
            if(error.code === 'P2003'){
                return res.status(400).json({
                    error : 'Invalid uses Reference',
                    details : 'meta' in error ? error.meta : undefined
                });
            }
        }

        return res.status(500).json({
            error : "Failed to create Post",
            details : process.env.NODE_ENV === "development" ? error : undefined
        });
    }
});


router.put('/:id', passport.authenticate('jwt', {session : false}), isAdmin, async (req, res)=>{
    const {id} = req.params;
    const {title, content, published} = req.body;
    if (!id) {
        return res.status(400).json({
            error : "Post id is required"
        })
    }

    try {
        const post = await prisma.post.update({
            where : {id : String(id)},
            data : {title, content, published},
        });
        return res.json(post);
    } catch (error) {
        return res.status(500).json({
            error : "Failed to update the post"
        })
    }
})


router.delete('/:id', passport.authenticate('jwt', {session : false}), isAdmin, async (req, res)=>{
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({
            error : "Post id is required"
        })
    }

    try {
        await prisma.post.delete({
            where : {id : String(id)}
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({
            error : "Failed to delete the post"
        })
    }
});


router.post('/:postId/comments', passport.authenticate('jwt', {session : false}), async (req, res)=>{
    console.log("====Comment Creation Request====");
    console.log("Header", JSON.stringify(req.header, null, 2));
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    console.log('User:', req.user);

    const {postId} = req.params;
    const {content} = req.body;
    const authorId = req.user?.id;

    if (req.user?.isAdmin) {
        return res.status(403).json({ error: 'Only users can create comments' });
    }
    
    if (!content) {
        console.error('Missing content in request body');
        return res.status(400).json({ error: 'Comment content is required' });
    }
    
    if (!authorId) {
        console.error('No authorId found in request.user');
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        console.log('Creating comment with:', { content, authorId, postId });
    
        const postExists = await prisma.post.findUnique({
        where: { id: String(postId) }
        });
        
        if (!postExists) {
        console.error('Post not found:', postId);
        return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await prisma.comment.create({
        data: {
            content: String(content),
            authorId: String(authorId),
            postId: String(postId)
        },
        include: {
            author: {
            select: {
                id: true,
                username: true,
                email: true
            }
            }
        }
        });

        console.log('Comment created successfully:', comment);
        return res.status(201).json(comment);
    } catch (error : unknown) {
        console.error('Error creating comment:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
        return res.status(400).json({ 
            error: 'Invalid post or user reference',
            details: 'meta' in error ? error.meta : undefined
        });
        }
        
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return res.status(500).json({ 
        error: 'Failed to create comment',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
})

export default router;
