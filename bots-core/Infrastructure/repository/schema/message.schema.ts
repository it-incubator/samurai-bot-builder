import mongoose, {Schema} from "mongoose";
import {IMessageDB} from "../interfaces/bot-core-database-repository.interface";

export const MessageSchema = new Schema({
    messageId: Number,
    chatId: Number,
    removeInterval: Number,
}, {timestamps: true})

// MODELS INTERFACE

export interface IMessageModel extends IMessageDB, mongoose.Document {
}
