import express from 'express';
import { authenticateToken } from '../middlewares/authToken';
import MessageRepository from '../repositories/messageRepository';
import MessageController from '../controllers/messageController';
import messageService from '../services/messageservice';
import ConversationRepository from '../repositories/conversationRepository';
import ConversationService from '../services/conversationService';

const  router = express.Router();

const messageRepository = new MessageRepository()
const messageservice = new messageService(messageRepository)

const conversationRepository = new ConversationRepository();
const conversationService = new ConversationService(conversationRepository)

const messageController = new MessageController(messageservice,conversationService)


router.get('/', messageController.getMessages.bind(messageController));
router.post('/', messageController.createMessage.bind(messageController));

router.patch('/changeIsRead',messageController.changeIsRead.bind(messageController))


export default router;
