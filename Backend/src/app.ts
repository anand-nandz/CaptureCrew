import express, { RequestHandler } from 'express' ;
import dotenv from 'dotenv' ;
import { connectDB } from './db/connectDatabase';
import cors from 'cors';
import path from 'path'
import cookieParser from 'cookie-parser'
import session from 'express-session';  // Correct import
import userRoutes from './routes/userRoutes'
import vendorRoutes from './routes/vendorRoutes'
import adminRoutes from './routes/adminRoutes'
dotenv.config()


export const app = express() ;

const corsOption = {
    origin : ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
    credentials : true
}

app.use(cors(corsOption)) ; 

app.use(express.static(path.join(__dirname, 'public'))) ;
app.use(express.static(path.join(__dirname,'../../Frontend/dist')))

const sessionMiddleware : RequestHandler = session({
    secret : process.env.SECRET as string,
    saveUninitialized :true ,
    resave : false ,
    cookie :{
        secure : false,
        httpOnly : true,
        maxAge : 24*60*60*1000,
        sameSite: 'lax'
    }
})

app.use(sessionMiddleware);

app.use(express.json()) ;
app.use(express.urlencoded({extended:true})) 
app.use(cookieParser()) ;

app.use('/api/user',userRoutes)
app.use('/api/vendor',vendorRoutes)
app.use('/api/admin',adminRoutes)

const PORT = process.env.PORT ;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...`);
        console.log(`Access it at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1); // Exit the process if the database connection fails
});