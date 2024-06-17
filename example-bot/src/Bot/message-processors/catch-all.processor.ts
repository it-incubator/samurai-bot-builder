import {MessageTypes} from './message-types'
import {IProcessor, ProcessorBase, ProcessorResult} from "../../../../bots-core/Infrastructure/processor";
import {MessageFromTelegram} from "../../../../bots-core/Infrastructure/message-parsers/message-from-telegram";
import {Message} from "../../../../bots-core/Infrastructure/message-parsers/message";

export class CatchAllProcessor extends ProcessorBase implements IProcessor {
    type: MessageTypes = MessageTypes.CatchAll;
    removeUserMessage = false;

    async _send(body: any, messageFromTelegram: MessageFromTelegram): Promise<ProcessorResult> {
        let handled = false;
        let message = "";

        if (body?.message?.chat?.id > 0) {
            handled = true;
            message = `Not processed message`;
        }
        return new ProcessorResult([
            new Message(message, body.message?.chat?.id, null, MessageTypes.No, 10)], handled);
    };
}


