import {ITelegramMessageWithReply} from "./telegram-message-with-reply";

export interface ITelegramNotification {
    update_id: number
    message: ITelegramMessageWithReply
}
