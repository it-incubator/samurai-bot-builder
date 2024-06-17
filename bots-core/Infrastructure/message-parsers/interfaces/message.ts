import {InlineKeyboardType, KeyboardType} from "../../../services/bot-api";

export enum MessageBodyTypes {
    PlainText = 0,
    MarkUp2 = 1,
    Html = 2
}

export interface IMessage {
    // text of message
    message: string
    // recipient telegram id
    messengerUserId: number
    // if we want add special keyboard
    markup?: InlineKeyboardType | KeyboardType | null
    // if want specify processor that should be activated for this message
    messageType?: number | null
    // 0 - message will not be deleted
    autoRemoveAfterSeconds: number
    // different supported by telegram type of markup (see telegram bot api doc
    bodyType: MessageBodyTypes
}