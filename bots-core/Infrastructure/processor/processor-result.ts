import {IResult} from "./interfaces/result";
import {IMessage} from "../message-parsers/interfaces/message";

export class ProcessorResult implements IResult {
    constructor(public messages: IMessage[],
                public handled: boolean,
                public removeInitUserMessageInterval: number | null = 10// in seconds
    ) {
        this.messages = messages.map(m => ({...m, message: m.message}))
    }

    /**
     * @param messages array Message
     */
    addMessages(messages: IMessage[]) {
        this.messages = messages.map(m => ({...m, message: m.message}));
    }

    /**
     * @param handled optional, by default true
     */
    handledResult(handled: boolean = true) {
        this.handled = handled;
    }
}