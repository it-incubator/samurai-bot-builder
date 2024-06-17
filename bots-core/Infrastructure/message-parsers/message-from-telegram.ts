import {ITelegramNotification} from "./interfaces/telegram-notification";
import {ICallbackQueryNotification} from "./interfaces/callback-query-notification";
import {ISender} from "./interfaces/sender";
import {ITelegramMessage} from "./interfaces/telegram-message";

export class MessageFromTelegram {
    public original: ITelegramNotification
    public callbackNotification: ICallbackQueryNotification | null = null

    constructor(originalMessageFromTelegram: any) {
        if (originalMessageFromTelegram.callback_query) {
            this.callbackNotification = originalMessageFromTelegram
        }

        this.original = originalMessageFromTelegram
    }

    get isMessageInsideGroup(): boolean {
        let id = this.original.message?.chat?.id
        return !!id && id < 0;
    }

    get groupId(): number {
        if (!this.isMessageInsideGroup) throw new Error('Message is not inside group')
        return this.original.message?.chat?.id as number;
    }

    get sender(): ISender {
        return this.original?.message?.from;
    }

    _getFirstHashTag(message: ITelegramMessage | undefined): string | null {
        if (!message?.entities?.length) return null;
        let entity = message?.entities.find(e => e.type === 'hashtag');
        if (!entity) return null;

        return message.text.substr(entity.offset, entity.length).toLowerCase();
    }

    getFirstHashTag(): string | null {
        return this._getFirstHashTag(this.original.message);
    }

    getFirstHashTagFromReplyMessage(): string | null {
        return this._getFirstHashTag(this.original.message?.reply_to_message);
    }

    getMentionUserId(): number | null {
        if (!this.original.message?.entities?.length) return null;
        let entity = this.original.message?.entities.find(e => e.type === 'text_mention');
        if (!!entity) {
            return entity.user.id;
        }
        return null;
    }

    getMentionUsername() {
        const message = this.original.message;
        if (!message?.entities?.length) return null;
        let entity = message.entities.find(e => e.type === 'mention');

        if (!entity) {
            entity = message.entities.find(e => e.type === 'text_link');
        }

        if (!entity) return null;
        return message.text.substr(entity.offset, entity.length);
    }

    getMessageId() {
        if (!this.original.message) throw new Error('Message should be exists')
        return this.original.message.message_id;
    }
}