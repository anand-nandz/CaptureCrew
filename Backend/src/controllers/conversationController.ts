import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/userTypes';
import { handleError } from "../utils/handleError";
import conversationService from '../services/conversationService';

class ConversationController {
    async createChat(req: Request, res: Response): Promise<void> {
        try {
            const {senderId, receiverId} = req.body;
            const chat = await conversationService.initializeChat(senderId,receiverId)
            
            res.status(200).json(chat)
        } catch (error) {
            handleError(res, error, 'initiateConversation');
        }
           
    }


    async findUserChats(req: Request, res: Response) {
        try {
            const userId : string = req.query.userId as string
            console.log(userId);
            
            if(!userId){
                res.status(400).json({message:'No user Found'})
                return
            }
            const chats = await conversationService.findChat(userId.toString());
            console.log(chats,'chats findesd');
            
            res.status(200).json(chats)
        } catch (error) {
            handleError(res, error, 'getConversations');
        }
    }

}

export default new ConversationController();