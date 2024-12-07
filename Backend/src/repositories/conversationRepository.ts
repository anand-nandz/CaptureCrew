import { BaseRepository } from "./baseRepository";
import Conversation, { ConversationDocument } from "../models/coversationModel";

class ConversationRepository extends BaseRepository<ConversationDocument> {
  constructor() {
    super(Conversation);
  }

  findConversations(userId: string) {
    return Conversation.find({ members: { $in: [userId] } }).sort({ updatedAt: -1 });
  }

  findByIdAndUpdate(id:string,text:string){
    return Conversation.findOneAndUpdate({_id:id},{$set:{recentMessage:text}})
  }
}

export default new ConversationRepository();
