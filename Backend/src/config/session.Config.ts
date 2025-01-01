import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import dotenv from 'dotenv'
dotenv.config()

const MongoDBStore = connectMongoDBSession(session);

const mongoURI = process.env.MONGO_URI as string;
console.log('MongoDB URI format check:', mongoURI?.includes('mongodb+srv://'));

const databaseName = mongoURI.split('/').pop()?.split('?')[0];
console.log(databaseName,'dbname');

export const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_URI as string,
  collection: 'sessions',
  connectionOptions: {
    ssl: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  },
  databaseName 
});

sessionStore.on('error', (error) => {
  console.error('Session store error details:', {
    message: error.message,
    stack: error.stack,
    mongoURI: mongoURI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials in logs
  });
});


sessionStore.on('error', (error) => {
  console.error('Session store error details:', {
    message: error.message,
    stack: error.stack,
    mongoURI: mongoURI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
  });
});
if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set in the environment variables');
  }
export const sessionOptions: session.SessionOptions  ={
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const
    },
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: process.env.NODE_ENV === 'production'
  }
