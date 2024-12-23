// config/loggerConfig.ts
import path from 'path';
import * as rfs from 'rotating-file-stream';
import fs from 'fs';

const logDirectory = path.join(__dirname, '../logs');

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

export const errorLogStream = rfs.createStream('error.log', {
  interval: '1d', 
  path: logDirectory,
  maxFiles: 7,  
});
