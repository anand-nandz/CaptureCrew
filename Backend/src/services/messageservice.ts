import { UpdateResult } from "mongodb";
import { CustomError } from "../error/customError"
import { IMessageRepository } from "../interfaces/repositoryInterfaces/message.Repository.Interface"
import { IMessageService } from "../interfaces/serviceInterfaces/message.Service.Interface";
import { MessageDocument } from "../models/messageModel";
import HTTP_statusCode from "../enums/httpStatusCode";

class messageService implements IMessageService{

    private messageRepository:IMessageRepository;

    constructor (messageRepository:IMessageRepository){
        this.messageRepository = messageRepository
    }
    createMessage = async(
        conversationId: string,
        senderId: string,
        text: string,
        imageName: string,
        imageUrl: string
    ): Promise<MessageDocument>=>{
        try {
            return await this.messageRepository.create({conversationId,senderId,text,imageName,imageUrl})
        } catch (error) {
            console.error('Error in creating message',error)
            throw new CustomError("Failed to create message", HTTP_statusCode.InternalServerError)
        }
    }

    findMessages = async(conversationId: string) =>{
        try {
            return await this.messageRepository.findByCondition({conversationId})
        } catch (error) {
            console.error('Error in finding message',error)
            throw new CustomError("Failed to find message", HTTP_statusCode.InternalServerError)
        }
    }

    changeReadStatus = async(chatId: string, senderId: string): Promise<UpdateResult> =>{
        try {
            return await this.messageRepository.updateReadStatus(chatId,senderId)
        } catch (error) {
            console.error('Error in changing message Status',error)
            throw new CustomError("Failed to chnage message status", HTTP_statusCode.InternalServerError)
        }
    }
}
export default messageService