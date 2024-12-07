import { CustomError } from "../error/customError"
import messageRepository from "../repositories/messageRepository"

class messageService{
    async createMessage(
        conversationId: string,
        senderId: string,
        text: string,
        imageName: string,
        imageUrl: string
    ){
        try {
            return await messageRepository.create({conversationId,senderId,text,imageName,imageUrl})
        } catch (error) {
            console.error('Error in creating message',error)
            throw new CustomError("Failed to create message", 500)
        }
    }

    async findMessages(conversationId: string) {
        try {
            return await messageRepository.findByCondition({conversationId})
        } catch (error) {
            console.error('Error in finding message',error)
            throw new CustomError("Failed to find message", 500)
        }
    }

    async changeReadStatus(chatId: string, senderId: string){
        try {
            return await messageRepository.updateReadStatus(chatId,senderId)
        } catch (error) {
            console.error('Error in changing message Status',error)
            throw new CustomError("Failed to chnage message status", 500)
        }
    }
}
export default new messageService()