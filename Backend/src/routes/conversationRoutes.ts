import express from 'express';
import conversationController from '../controllers/conversationController';

const  router = express.Router();


router.get('/', conversationController.findUserChats);
router.post('/', conversationController.createChat);


export default router;
