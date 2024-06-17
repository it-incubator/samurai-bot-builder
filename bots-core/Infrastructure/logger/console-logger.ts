import {BotLoggerInterface, LoggerSettingsInterface} from "./interfaces";

export class ConsoleLogger extends BotLoggerInterface {
    constructor(settings: LoggerSettingsInterface) {
        super(settings);
    }

    initialization() {
    }


    async addError(message: string,
                   sourceName: string = "unknown",
                   functionName: string = "unknown",
                   requestId: string | null = null): Promise<void> {
        console.log(this.getDate(), " LOGGER ERROR: ", message);
    }

    async addInfo(message: string,
                  sourceName: string = "unknown",
                  functionName: string = "unknown",
                  requestId: string | null = null): Promise<void> {
        console.log(this.getDate(), " LOGGER INFO: ", message);
    }

    private getDate(){
        return new Date().toISOString();
    }
}