import {Request, Response, NextFunction} from 'express'
import passport from "passport"


export const authenticateJWT = (req : Request, res : Response, next : NextFunction)=>{
    passport.authenticate('jwt', {session : false}, (err : Error | null, user? : any, info? : any)=>{
        console.log('Auth middleware - User', user);
        console.log('Auth middleware - User', err);
        console.log('Auth middleware - User', info);
    
        if(err){
            console.error('Authentication Erorr ', err);
            return res.status(401).json({error : 'Unauthorized - Invalid or expired Token'});
        }

        if(!user){
            console.error('No user found in the JWT');
            return res.status(401).json({
                error : 'Unauthorized - Invalid or expired token'
            })
        }

        req.user = user;
        return next();
    })(req, res, next);
};



export const isAdmin = (req : Request, res : Response, next : NextFunction):void=>{
    console.log("Checking the Admin status for the user", req.user);

    if(!req.user){
        console.error("No user found in the request");
        res.status(401).json({
            error : 'Authentication Requried'
        })
        return ;
    }

    if(req.user.isAdmin !== true){
        console.error("User is not an Admin", req.user);
        res.status(403).json({
            error : 'Admin Access Required',
            user : req.user
        });
        return ;
    }

    console.log("user is Admin proceeding...");
    next();
}