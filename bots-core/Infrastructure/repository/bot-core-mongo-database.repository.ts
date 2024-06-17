import mongoose from 'mongoose'
import {IBotCoreDbRepository, IMessageDB, IMessageWithId} from "./interfaces/bot-core-database-repository.interface";
import {MongooseProvider} from "./database-providers/mongoose.provider";

export const makeConnection = async (connectionString: string) => {
    try {
        await mongoose.connect(connectionString, {})
    } catch (e) {
        console.error("ERROR", e);
    }
}

export class BotCoreMongoDatabaseRepository implements IBotCoreDbRepository {
    private connected = false;
    private initsFunctions = [] as Array<() => void>;

    constructor(private mongooseProvider: MongooseProvider,
                private makeConnection: (connectionString: string) => Promise<any>,
                private readonly connectionString: string) {
    }

    public isConnected(): boolean {
        // if connection state = ConnectionStates.connected (1) we need return true
        return this.mongooseProvider.getConnectionState() === 1;
    }

    async connect() {
        await this.makeConnection(this.connectionString);
        console.log('We\'re connected to DB');
        this.connected = true;
        this.initsFunctions.forEach(f => f());
    }

    addInitCallback(callback: () => void) {
        if (this.connected) callback()
        this.initsFunctions.push(callback)
    }

    // MESSAGES

    async getMessagesInDeleteQueue(): Promise<IMessageWithId[]> {
        return this.mongooseProvider.Message.find({})
    };

    async getMessageByIdInDeleteQueue(_id: string): Promise<IMessageDB | null> {
        return this.mongooseProvider.Message.findOne({_id})
    };

    async addMessageInDeleteQueue(chatId: number, messageId: number, removeInterval: number): Promise<IMessageDB> {
        return this.mongooseProvider.Message.create({
            messageId,
            chatId,
            removeInterval,
        })
    };

    async removeMessageInDeleteQueue(_id: string): Promise<boolean> {
        const removeResult = await this.mongooseProvider.Message.deleteOne({_id})
        return removeResult.deletedCount > 0
    };
}
