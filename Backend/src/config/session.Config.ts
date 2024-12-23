import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import dotenv from 'dotenv'
dotenv.config()

const MongoDBStore = connectMongoDBSession(session);

export const sessionStore = new MongoDBStore({
  uri: process.env.MONGODB_URI as string,
  collection: 'sessions',
});

sessionStore.on('error', (error) => {
  console.error('Session store error:', error);
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
    saveUninitialized: false
  }
