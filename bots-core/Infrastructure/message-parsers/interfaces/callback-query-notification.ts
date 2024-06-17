import {ICallbackQuery} from "./callback-query";

export interface ICallbackQueryNotification {
    update_id: number
    callback_query: ICallbackQuery
}
