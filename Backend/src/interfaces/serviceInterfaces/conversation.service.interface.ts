import { ConversationDocument } from "../../models/coversationModel";

export interface IConversationService{
    updateConversation(id: string, text: string): Promise<ConversationDocument | null>;
    findChat(userId: string): Promise<ConversationDocument[]>;
    initializeChat(senderId: string, receiverId: string):Promise<ConversationDocument | null>
}