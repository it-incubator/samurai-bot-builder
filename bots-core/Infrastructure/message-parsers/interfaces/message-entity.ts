import {ISender} from "./sender";

export interface IMessageEntityType {
    offset: number
    length: number
    type: 'text_mention' | 'mention' | 'hashtag' | 'text_link'
    user: Omit<ISender, 'language_code'>
}