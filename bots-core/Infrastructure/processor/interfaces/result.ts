import {IMessage} from "../../message-parsers/interfaces/message";

export interface IResult {
    messages: IMessage[]
    handled: boolean
    removeInitUserMessageInterval: number | null // in seconds
}