import { BaseRepository } from "./baseRepository";
import Conversation, { ConversationDocument } from "../models/coversationModel";
import { IConversationRepository } from "../interfaces/repositoryInterfaces/conversation.repository.interface";

class ConversationRepository extends BaseRepository<ConversationDocument> implements IConversationRepository {
  constructor() {
    super(Conversation);
  }

  findConversations(userId: string): Promise<ConversationDocument[]> {
    return Conversation.find({ members: { $in: [userId] } }).sort({ updatedAt: -1 });
  }

  findByIdAndUpdate(id:string,text:string): Promise<ConversationDocument | null>{
    return Conversation.findOneAndUpdate({_id:id},{$set:{recentMessage:text}})
  }
}

export default ConversationRepository;
