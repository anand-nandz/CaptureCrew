import { BaseRepository } from "./baseRepository";
import Message, { MessageDocument } from "../models/messageModel";
import { IMessageRepository } from "../interfaces/repositoryInterfaces/message.Repository.Interface";
import { UpdateResult } from "mongodb";

class MessageRepository extends BaseRepository<MessageDocument> implements IMessageRepository{
  constructor() {
    super(Message);
  }

  updateReadStatus = async(chatId: string, senderId: string): Promise<UpdateResult> =>{
    return Message.updateMany({conversationId:chatId,senderId:senderId},{$set:{isRead: true}})
  }

  
}

export default MessageRepository;
