import { MessageDocument } from "../../models/messageModel";
import { UpdateResult } from "mongodb";

export interface IMessageRepository {
    findByCondition(condition: Record<string, unknown>): Promise<MessageDocument[]>;
    create(data: Partial<MessageDocument>): Promise<MessageDocument>;
    updateReadStatus(chatId: string, senderId: string):Promise<UpdateResult>
}