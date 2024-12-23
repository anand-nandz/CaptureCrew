import { CustomError } from "../error/customError";
import { IConversationRepository } from "../interfaces/repositoryInterfaces/conversation.repository.interface";
import { IConversationService } from "../interfaces/serviceInterfaces/conversation.service.interface";
import { ConversationDocument } from "../models/coversationModel";
import conversationRepository from "../repositories/conversationRepository";

class conversationService implements IConversationService {

    private conversationRepository: IConversationRepository;

    constructor(conversationRepository: IConversationRepository){
        this.conversationRepository = conversationRepository
    }

    findChat = async(userId: string): Promise<ConversationDocument[]> =>{
        try {
            return await this.conversationRepository.findConversations(userId)
        } catch (error) {
            console.error("Error in findChat:", error);
            throw new CustomError("Error finding chats.", 500);
        }
    }

    initializeChat = async(senderId: string, receiverId: string):Promise<ConversationDocument | null> =>{
        try {
            let chat = await this.conversationRepository.findOne({
                members: [senderId, receiverId]
            });

            if(!chat){
                const newChat = await this.conversationRepository.create({
                    members: [senderId, receiverId],
                })
                
                return newChat
            }
            return chat
        } catch (error) {
            console.error("Error in initializeChat:", error);
            throw new CustomError("Error initializing Chat.", 500);
        }
    }

    updateConversation = async(id: string, text: string): Promise<ConversationDocument | null>=>{
        try {
            return await this.conversationRepository.findByIdAndUpdate(id,text)
        } catch (error) {
            console.error("Error in updateConversation:", error);
            throw new CustomError("Error updateing Conversation.", 500);
        }
    }
}

export default conversationService