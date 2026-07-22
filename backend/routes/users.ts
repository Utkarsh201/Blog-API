import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import passport from "passport"
import prisma from "../prisma/client.js"


const router = express.Router();

const getJwtSecret = () => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET must be set in the environment');
    }
    return jwtSecret;
}


router.post("/signup", async(req, res)=>{
    try {
        const {username, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data : {
                username,
                email,
                password : hashedPassword
            },
        });

        const token = jwt.sign({userId : user.id}, getJwtSecret());
        return res.status(201).json({token})
    } catch (error) {
        return res.status(400).json({
            error : 'User Registration Failed'
        });
    }
})

router.post('/login', async(req, res)=>{
    try {
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({where : {email}});

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({
                error : 'Invalid Credentials'
            })
        }

        const token = jwt.sign({userId : user.id}, getJwtSecret());
        return res.json({token});
    } catch (error) {
        return res.status(400).json({
            error : 'Login Failed'
        })
    }


})


router.get('/profile', passport.authenticate('jwt', {session : false}),(req, res)=>{
    return res.json({
        user : req.user
    })
})

export default router
