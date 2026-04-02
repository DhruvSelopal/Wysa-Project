import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOption {
    text: string;
    optionId:string,
    // weights per module
    weights: Map<string, number>;
}

export type MongoQuestion = IQuestion & {
  _id: Types.ObjectId;
};

export interface IQuestion extends Document {
    text: string;

    // primary module (optional, for grouping)
    module: string;

    options: IOption[];
}

const QuestionSchema: Schema = new Schema({
    text: { type: String, required: true },

    module: { type: String, required: true },

    options: [
        {
            text: { type: String, required: true },

            optionId : {type : String, required: true},
            
            weights: {
                type: Map,
                of: Number,
                required: true
            }
        }
    ]
});

export const Question = mongoose.model<IQuestion>("Questions", QuestionSchema);