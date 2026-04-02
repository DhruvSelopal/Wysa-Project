import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    birthdate: Date;
    age: number;
}


export type MongoUser = IUser & {
  _id: Types.ObjectId;
};

const UserSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        birthdate: {
            type: Date,
            required: true
        },
        age: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("Users", UserSchema);