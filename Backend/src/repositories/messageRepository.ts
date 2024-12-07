import { BaseRepository } from "./baseRepository";
import Message, { MessageDocument } from "../models/messageModel";

class MessageRepository extends BaseRepository<MessageDocument> {
  constructor() {
    super(Message);
  }

  async updateReadStatus(chatId: string, senderId: string){
    return Message.updateMany({conversationId:chatId,senderId:senderId},{$set:{isRead: true}})
  }

  
}

export default new MessageRepository();
