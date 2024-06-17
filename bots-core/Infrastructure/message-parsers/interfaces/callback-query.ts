import {ISender} from "./sender";
import {ITelegramMessage} from "./telegram-message";

export interface ICallbackQuery {
    chat_instance: string
    data: string
    id: string
    from: ISender
    message: ITelegramMessage
}