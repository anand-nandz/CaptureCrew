import { Socket, Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import ConversationRepository from '../repositories/conversationRepository';
import ConversationService from '../services/conversationService';
import dotenv from 'dotenv';
dotenv.config(); 
interface Client {
    clientId: string;
    socketId: string;
    lastSeen: number;
}

let io: SocketServer;
let clients: Client[] = []

const conversationRepository = new ConversationRepository();
const conversationService = new ConversationService(conversationRepository)

const configSocketIO = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
            methods: ['GET', 'POST'],
            credentials: true
        },
    });

    const addClient = (clientId: string, socketId: string): void => {
        clients = clients.filter(client => client.clientId !== clientId);
        clients.push({ clientId, socketId, lastSeen: Date.now() });
    }

    const removeClient = (socketId: string): void => {
        clients = clients.filter(client => client.socketId !== socketId);
    }

    const getClient = (clientId: string): Client | undefined => {
        return clients.find((client) => client.clientId === clientId)
    }

    io.on('connection', (socket: Socket) => {
        console.log('User Connected', socket.id);
        socket.on('joinConversation', (conversationId) => {
            socket.join(conversationId);
        });
        socket.on('addUser', (clientId: string) => {
            addClient(clientId, socket.id)
            io.emit('getUsers', clients)
        })

        socket.on(
            'sendMessage', async (message: {
                senderId: string,
                receiverId: string,
                text: string,
                imageName: string,
                imageUrl: string;
                conversationId: string
            }) => {
            const client = getClient(message.receiverId)
            await conversationService.updateConversation(message.conversationId, message.text);

            if (client) {
                io.to(client.socketId).emit('getMessage', {
                    senderId: message.senderId,
                    text: message.text,
                    imageName: message.imageName,
                    imageUrl: message.imageUrl,
                    conversationId: message.conversationId
                })

            } else {
                console.error('User Not Found', message.receiverId)
            }
            
            const senderClient = getClient(message.senderId);
            if (senderClient) {
                io.to(senderClient.socketId).emit('getMessage', {
                    senderId: message.senderId,
                    text: message.text,
                    imageName: message.imageName,
                    imageUrl: message.imageUrl,
                    conversationId: message.conversationId,
                });
            }

            io.to(message.conversationId).emit('conversationUpdated', {
                conversationId: message.conversationId,
                recentMessage: message.text,
                updatedAt: new Date(),
            });
            
            
        }
        )

        socket.on('disconnect', () => {
            removeClient(socket.id);
            io.emit('getUsers', clients)
        })

    })
};

export { configSocketIO, io }