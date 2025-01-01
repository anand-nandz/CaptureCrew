import { Request, Response } from 'express';
import express from 'express';
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
import { createServer } from 'http';
import { configSocketIO } from './config/socket_config';
import morgan from 'morgan';
import BookingStatusCron from './utils/BookingStatusCron';
import BookingRepository from './repositories/bookingRepository';
import { errorLogStream } from './config/loggerConfig';
import { corsOption } from './config/corsConfig';
import { sessionOptions, sessionStore } from './config/session.Config';
import HTTP_statusCode from './enums/httpStatusCode';

dotenv.config();

export const app = express();
const server = createServer(app);
configSocketIO(server);

app.use(
  morgan('combined', {
    stream: errorLogStream,
    skip: (req: Request, res: Response) => res.statusCode < HTTP_statusCode.BadRequest,
  })
);


sessionStore.on('connected', () => {
  console.log('Session store connected to MongoDB successfully');
});

app.use(morgan('dev'));
app.use(cors(corsOption));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));
app.use(session(sessionOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', chatRoutes);

const bookingRepository = new BookingRepository();
BookingStatusCron.initializeCronJobs(bookingRepository);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
      console.log(`Access it at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
