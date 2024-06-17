import {ISender} from "./sender";
import {IMessageEntityType} from "./message-entity";

export interface ITelegramMessage {
    'message_id': number
    'from': ISender
    'chat'?: {
        'id': number,
        'title': string,
        'type': string,
        'all_members_are_administrators': boolean
    }
    'date': number
    'text': string
    'entities'?: IMessageEntityType[]
}