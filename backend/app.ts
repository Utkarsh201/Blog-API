import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
// import './config/passport.js';


dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();


const allowOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(x => x.trim()) : [];


app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    if (allowOrigins.includes(origin) || allowOrigins.includes('*')) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        return next();
    } else {
        res.status(403).json({ error: 'Forbidden' });
    }
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Server Error", err);
    res.status(500).json({
        error: 'Internal Server Error'
    })
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


prisma.$connect()
    .then(() => {
        console.log("Connected to Data Base");
    }).catch((error: any) => {
        console.log("Database connection Error", error);
    })

// routes here 

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})