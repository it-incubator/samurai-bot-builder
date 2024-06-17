import {InlineKeyboardType, KeyboardType} from "../../services/bot-api";
import {MessageTypes} from "../../../example-bot/src/Bot/message-processors/message-types";
import {IMessage, MessageBodyTypes} from "./interfaces/message";

export class Message implements IMessage {
    constructor(public message: string,
                public messengerUserId: number,
                public markup: InlineKeyboardType | KeyboardType | null = null,
                public messageType: MessageTypes | null | number = null,
                public autoRemoveAfterSeconds = 0,
                public bodyType = MessageBodyTypes.PlainText) {
    };
}
