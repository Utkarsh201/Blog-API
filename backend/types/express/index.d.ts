import {User as PrismaUser} from '@prisma/client'

declare global{
    namespace Express {
        interface User extends Omit<PrismaUser, 'id'>{
            id : String,
            isAdmin : Boolean
        }
        interface Request {
            user? : User;
        }
    }
}

export {};