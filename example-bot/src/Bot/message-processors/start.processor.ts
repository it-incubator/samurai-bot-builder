import {MessageTypes} from './message-types'
import {IProcessor, ProcessorBase, ProcessorResult} from "../../../../bots-core/Infrastructure/processor";
import {MessageFromTelegram} from "../../../../bots-core/Infrastructure/message-parsers/message-from-telegram";
import {MessageBodyTypes} from "../../../../bots-core/Infrastructure/message-parsers/interfaces/message";
import {Message} from "../../../../bots-core/Infrastructure/message-parsers/message";
import keyboards from "../keyboards/keyboards";


export class StartProcessor extends ProcessorBase implements IProcessor {
    static menuText = '/start';
    type: MessageTypes = MessageTypes.Start;

    async _send(body: any, messageFromTelegram: MessageFromTelegram): Promise<ProcessorResult> {
        let handled = false;
        let message = "";

        if (!messageFromTelegram.isMessageInsideGroup && body.message && body.message.text?.indexOf("/start") === 0) {
            handled = true;

            message = `Hello, <b>${body.message.chat.username}</b>! 
Your telegram id - <b>${body.message.chat.id}</b>`;
        }

        return new ProcessorResult([
            new Message(message, body.message.chat.id,
                keyboards.mainMenu, null, 0, MessageBodyTypes.Html)], handled);
    };
}


