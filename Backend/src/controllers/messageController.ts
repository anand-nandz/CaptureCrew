import { Request, Response } from 'express';
import { handleError } from "../utils/handleError"
import conversationService from '../services/conversationService';
import { IMessageService } from '../interfaces/serviceInterfaces/message.Service.Interface';
import { IConversationService } from '../interfaces/serviceInterfaces/conversation.service.interface';

class MessageController {
    private messageservice:IMessageService;
    private conversationService: IConversationService;

    constructor (messageservice:IMessageService, conversationService: IConversationService) {
        this.messageservice = messageservice,
        this.conversationService = conversationService
    }
    createMessage = async(req: Request, res: Response): Promise<any> =>{
        try {
            const { conversationId, senderId, text, imageName, imageUrl } = req.body
            const response = await this.messageservice.createMessage(
                conversationId,
                senderId,
                text,
                imageName,
                imageUrl
            )

            await this.conversationService.updateConversation(conversationId, text)
            res.status(200).json(response)
        } catch (error) {
            handleError(res, error, 'sendMessage')
        }
    }

    getMessages = async(req: Request, res: Response): Promise<void> =>{
        try {
            const conversationId: string = req.query.conversationId as string
            const messages = await this.messageservice.findMessages(conversationId)
            
            res.status(200).json(messages)
        } catch (error) {
            handleError(res, error, 'getMessages')
        }

    }

    changeIsRead = async(req: Request, res: Response): Promise<void> =>{
        try {
            const { chatId, senderId } = req.body
            const updateResult = await this.messageservice.changeReadStatus(chatId, senderId)
            res.status(200).json({ 
                updateResult,
                matchedCount: updateResult.matchedCount,
                modifiedCount: updateResult.modifiedCount,
            })
        } catch (error) {
            handleError(res, error, 'changeIsRead')
        }
    }
}

export default MessageController;