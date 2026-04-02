import mongoose, { ObjectId } from "mongoose";
import {  LoginDTO, RegisterUserServiceMode, UserServiceModel } from "../dto/user-dto";
import { IUser, MongoUser, User } from "../models/user-models";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export class UserService{
    static createUser = async (userRegister:RegisterUserServiceMode):Promise<UserServiceModel | null> =>{   // returns user id
        const user = await User.findOne({email:userRegister.email});
        if(!!user) return null;

        const hashedPassword = await hashPassword(userRegister.password);
        userRegister.password =  hashedPassword;

        const userCreated = await User.create(
            {
            ...userRegister
            }
        ) 
        return UserService.mapMongoUserToServiceModel(userCreated);
    }

    static updateUser = async (userRegister:RegisterUserServiceMode,userId:string):Promise<boolean> =>{
        if(mongoose.isObjectIdOrHexString(userId)){
            const result = await User.
                        updateOne({_id:userId},
                        {$set:{...userRegister,updatedAt: new Date()}});
            return result.matchedCount > 0;
        }
        return false;
    }
    
    static getUser = async (userId:string) : Promise<UserServiceModel | null> =>{
        if(mongoose.isObjectIdOrHexString(userId)){
            const user = await User.findById(userId).lean();
            if(!user) return null;
            const userToReturn : UserServiceModel = UserService.mapMongoUserToServiceModel(user);
            return userToReturn;
        }
        return null;
    }

    static login = async (login:LoginDTO):  Promise<string | null> =>{
        const user = await User.findOne({email:login.email}).lean();
        if(user){
            const passwordMatches = await comparePassword(login.password,user.password);
            if(passwordMatches) return generateToken(user._id.toString());
        }
        return null;
    }

    private static mapMongoUserToServiceModel = (user:MongoUser) : UserServiceModel =>{
        const userToReturn : UserServiceModel = {
                age:user.age,
                birthdate:user.birthdate,
                email:user.email,
                id:user._id.toString(),
                name:user.name
            }
        return userToReturn;
    }
}