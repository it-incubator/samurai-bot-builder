import {LoggerSettingsInterface} from "./logger-settings.interface";

export abstract class BotLoggerInterface {
    protected settings: LoggerSettingsInterface;

    protected constructor(settings: LoggerSettingsInterface) {
        this.settings = settings;
    }

    abstract initialization(): void;

    abstract addError(message: string, sourceName: string, functionName: string, requestId: string | null): Promise<void>;

    abstract addInfo(message: string, sourceName: string, functionName: string, requestId: string | null): Promise<void>;

}