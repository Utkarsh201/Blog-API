import 'dotenv/config'
import passport from 'passport'
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt'
import prisma from '../prisma/client.js'

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in the environment');
}


const opts = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : JWT_SECRET
}

passport.use('jwt', new JwtStrategy(opts, async (jwtPayload, done)=>{
    try {
        console.log('JWT payload', jwtPayload);
        const userId = jwtPayload.userId || jwtPayload.id || jwtPayload.sub;

        if(!userId){
            console.error('No user ID found in JWT payload');
            return done(null, false, { message: 'No user ID in token' });
        }

        const user = await prisma.user.findUnique({
            where : {id : userId}
        });

        if(user){
            console.log('Authenticated user : ', {id : user.id, email: user.email});
            return done(null, {...user, isAdmin:false});
        }

        const admin = await prisma.admin.findUnique({
            where : {id : userId}
        });

        if(admin){
            console.log("Authenticated Admin : ", {id:admin.id, email:admin.email});
            return done(null, {...admin, isAdmin:true});
        }

        console.error('User not found for Id :', userId);
        return done(null, false, {message : 'User Not found'});
    } catch (error) {
        console.error('Error in Jwt authentication :', error);
        return done(error, false);
    }
}))
