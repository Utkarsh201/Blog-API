import express from "express"
import {PrismaClient} from '@prisma/client'
import passport from "passport"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || ""; 

router.post('/signup', async (req, res)=>{
    try {
        const {username, email, password, adminKey} = req.body;
        const ADMIN_KEY = process.env.ADMIN_KEY;
        if(ADMIN_KEY  !== adminKey){
            return res.status(403).json({
                error : 'Invalid Admin Key'
            })
        }

        const existingAdmin = await prisma.admin.findFirst({
            where : {OR : [{email}, {username}]}
        });

        if(existingAdmin){
            return res.status(400).json({
                error : "Admin already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = prisma.admin.create({
            data : {
                username, 
                email,
                password : hashedPassword
            },
        })

        const token = jwt.sign({
            id : admin.id,
            isAdmin : true,
        }, JWT_SECRET);

        return res.status(201).json({
            token, redirect : './admin/dashboard'
        });

    } catch (error) {
        return res.status(400).json({error : "Admin registratoin failed"});
    }
}); 
router.post('/login', async (req, res)=>{
    try {
        const {email, password} = req.body;
        const admin = await prisma.admin.findUnique({ where : {email} });

        if(!admin || !(await bcrypt.compare(password, admin.password))){
            return res.status(401).json({
                error : "Invalid credentials"
            })
        }
        const token = jwt.sign({
            id : admin.id,
            isAdmin : true
        }, JWT_SECRET)
        return res.json({token, redirect : '/admin/dashboard'});
    } catch (error) {
        return res.status(400).json({
            error : "Login Failed"
        })
    }
});
router.get('/profile',  passport.authenticate('jwt', {session : false}), (res, req)=>{
    return res.json({admin : req.user});
});
router.post('/logout', passport.authenticate('jwt', {session : false}), (_req, res)=>{
    return res.status(200).json({message : 'Sucessfully logout'});
})


export default router;


