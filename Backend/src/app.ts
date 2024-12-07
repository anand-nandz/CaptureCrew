
import express, { RequestHandler } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDatabase';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import userRoutes from './routes/userRoutes';
import vendorRoutes from './routes/vendorRoutes';
import adminRoutes from './routes/adminRoutes';
import messageRoutes from './routes/messageRoutes';
import chatRoutes from './routes/conversationRoutes';
import connectMongoDBSession from 'connect-mongodb-session';
import { BookingStatusCron } from './utils/BookingStatusCron';
import { createServer } from 'http';
import { configSocketIO } from './utils/socket_config';
import morgan from 'morgan';

dotenv.config();

export const app = express();
const server = createServer(app)
const MongoDBStore = connectMongoDBSession(session);
configSocketIO(server)

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI as string,
  collection: 'sessions'
});

store.on('error', function(error) {
  console.log('Session store error:', error);
});

const corsOption = {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true
};

app.use(cors(corsOption));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set in the environment variables');
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },
  store: store,
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', chatRoutes);



BookingStatusCron.initializeCronJobs()
const PORT = process.env.PORT;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
    console.log(`Access it at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});