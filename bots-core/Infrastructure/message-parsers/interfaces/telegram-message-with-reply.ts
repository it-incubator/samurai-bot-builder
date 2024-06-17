import {ITelegramMessage} from "./telegram-message";

export interface ITelegramMessageWithReply extends ITelegramMessage {
    'reply_to_message': ITelegramMessage
}