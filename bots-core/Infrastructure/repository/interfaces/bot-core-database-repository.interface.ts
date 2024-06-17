export interface IBotCoreDbRepository {
    connect(): Promise<void>
    isConnected(): boolean

    addInitCallback(callback: () => void): void

    // MessagesInDeleteQueue

    getMessagesInDeleteQueue(): Promise<IMessageWithId[]>;

    getMessageByIdInDeleteQueue(id: string): Promise<IMessageDB | null>;

    addMessageInDeleteQueue(chatId: number, messageId: number, removeInterval: number): Promise<IMessageDB>;

    removeMessageInDeleteQueue(id: string): Promise<boolean>;
}

export interface IMessageWithId extends IMessageDB {
    _id: string;
}

export interface IMessageDB extends ITimestamps {
    messageId: number;
    chatId: number;
    removeInterval: number;
}

interface ITimestamps {
    createdAt: Date;
    updatedAt: Date;
}