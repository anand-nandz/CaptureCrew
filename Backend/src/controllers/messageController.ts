import { Request, Response } from 'express';
import { handleError } from "../utils/handleError"
import messageservice from '../services/messageservice';
import conversationService from '../services/conversationService';

class MessageController {
    async createMessage(req: Request, res: Response): Promise<any> {
        try {
            const { conversationId, senderId, text, imageName, imageUrl } = req.body
            const response = await messageservice.createMessage(
                conversationId,
                senderId,
                text,
                imageName,
                imageUrl
            )
            console.log(response, 'after message creatrion');

            await conversationService.updateConversation(conversationId, text)
            res.status(200).json(response)
        } catch (error) {
            handleError(res, error, 'sendMessage')
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const conversationId: string = req.query.conversationId as string
            const messages = await messageservice.findMessages(conversationId)
            console.log(messages, 'messagesssssssssss');
            res.status(200).json(messages)
        } catch (error) {
            handleError(res, error, 'getMessages')
        }

    }

    async changeIsRead(req: Request, res: Response) {
        try {
            const { chatId, senderId } = req.body
            console.log(req.body);
            const messages = await messageservice.changeReadStatus(chatId, senderId)
            res.status(200).json({ messages })
        } catch (error) {
            handleError(res, error, 'changeIsRead')
        }
    }
}

export default new MessageController()