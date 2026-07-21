import {User as PrismaUser} from '@prisma/client'

declare global{
    namespace Express {
        interface User extends Omit<PrismaUser, 'id'>{
            id : string,
            isAdmin : boolean
        }
        interface Request {
            user? : User;
        }
    }
}

export {};