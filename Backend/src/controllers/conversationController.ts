import { Request, Response } from 'express';
import { handleError } from "../utils/handleError";
import { IConversationService } from '../interfaces/serviceInterfaces/conversation.service.interface';

class ConversationController {

    private conversationService: IConversationService;

    constructor (conversationService: IConversationService) {
        this.conversationService = conversationService
    }
    createChat = async(req: Request, res: Response): Promise<void> =>{
        try {
            const {senderId, receiverId} = req.body;
            const chat = await this.conversationService.initializeChat(senderId,receiverId)
            
            res.status(200).json(chat)
        } catch (error) {
            handleError(res, error, 'initiateConversation');
        }
           
    }


    findUserChats = async(req: Request, res: Response): Promise<void> => {
        try {
            const userId : string = req.query.userId as string
            
            if(!userId){
                res.status(400).json({message:'No user Found'})
                return
            }
            const chats = await this.conversationService.findChat(userId.toString());
            
            res.status(200).json(chats)
        } catch (error) {
            handleError(res, error, 'getConversations');
        }
    }

}

export default ConversationController;