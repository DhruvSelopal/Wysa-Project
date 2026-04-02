import mongoose, { Document, Schema, Types } from "mongoose";

export interface  Answer{
    questionId: string;
    OptionId: string;
    questionModule:string;
}
export interface moduleAndQuestionsAnswered{
    module:string,
    questions: Array<string>
}

export interface IUserState extends Document {
    userId: mongoose.Types.ObjectId;
    currentQuestionId: mongoose.Types.ObjectId;

    moduleScores: Map<string, number>;

    answers: Answer[];

    isCompleted: boolean;
}

export type MongoUserState = IUserState & {
  _id: Types.ObjectId;
};

const UserStateSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    currentQuestionId: {
        type: Schema.Types.ObjectId,
        ref: "Question"
    },

    moduleScores: {
        type: Map,
        of: Number,
        default: {}
    },

    answers: [
        {
            questionId: {
                type: String,
                ref: "Question",
                required: true
            },
            OptionId: {
                type: String,
                required: true
            },
            questionModule: {
                type: String,
                required: true
            }
        }
    ],

    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const UserState = mongoose.model<IUserState>(
    "UserStates",
    UserStateSchema
);