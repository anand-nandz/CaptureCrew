import { ConversationDocument } from "../../models/coversationModel";

export interface IConversationRepository {
    findByIdAndUpdate(id: string, text: string): Promise<ConversationDocument | null>;
    findConversations(userId: string): Promise<ConversationDocument[]>
    create(data: Partial<ConversationDocument>): Promise<ConversationDocument>;
    findOne(condition: Record<string, unknown>): Promise<ConversationDocument | null>;

}