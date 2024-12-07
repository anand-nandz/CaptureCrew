import express from 'express';
import messageController from '../controllers/messageController';
import { authenticateToken } from '../middlewares/authToken';

const  router = express.Router();


router.get('/', messageController.getMessages);
router.post('/', messageController.createMessage);

router.patch('/changeIsRead',messageController.changeIsRead)


export default router;
