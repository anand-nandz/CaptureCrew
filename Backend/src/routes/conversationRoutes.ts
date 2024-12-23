import express from 'express';
import ConversationRepository from '../repositories/conversationRepository';
import ConversationService from '../services/conversationService';
import ConversationController from '../controllers/conversationController';

const  router = express.Router();
const conversationRepository = new ConversationRepository();
const conversationService = new ConversationService(conversationRepository)
const conversationController = new ConversationController(conversationService)

router.get('/', conversationController.findUserChats.bind(conversationController));
router.post('/', conversationController.createChat.bind(conversationController));


export default router;
