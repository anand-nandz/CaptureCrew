import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import dotenv from 'dotenv'
dotenv.config()

const MongoDBStore = connectMongoDBSession(session);
console.log('MongoDB URI for session store:', process.env.MONGO_URI);
export const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_URI as string,
  collection: 'sessions',
  databaseName: 'CaptureCrew',
  connectionOptions: {
    serverSelectionTimeoutMS: 10000,
    directConnection: true
  }
});

sessionStore.on('connected', () => {
  console.log('Session store connected to MongoDB successfully');
});

sessionStore.on('error', (error) => {
  console.error('Session store error details:', {
    message: error.message,
    stack: error.stack,
    uri: process.env.MONGO_URI // This will help verify the URI being used
  });
});
if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set in the environment variables');
  }
export const sessionOptions: session.SessionOptions  ={
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const
    },
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true
  }
