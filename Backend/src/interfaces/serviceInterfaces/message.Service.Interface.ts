import { MessageDocument } from "../../models/messageModel";
import { UpdateResult } from "mongodb";

export interface IMessageService {
    findMessages(conversationId: string): Promise<MessageDocument[]>;
    createMessage(
        conversationId: string,
        senderId: string,
        text: string,
        imageName: string,
        imageUrl: string
    ): Promise<MessageDocument>;
    changeReadStatus(chatId: string, senderId: string):Promise<UpdateResult>
}