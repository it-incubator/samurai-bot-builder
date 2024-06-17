import {ConnectionStates, Model, Mongoose} from "mongoose";
import {IMessageModel, MessageSchema} from "../schema/message.schema";

export class MongooseProvider {
    public Message: Model<IMessageModel>;

    constructor(private mongoose: Mongoose) {
        this.Message = mongoose.model<IMessageModel>('Message', MessageSchema);
    }

    public getConnectionState(): ConnectionStates {
        // if connection undefined we need return status disconnected
        return this.mongoose.connection?.readyState ?? ConnectionStates.disconnected;
    }
}