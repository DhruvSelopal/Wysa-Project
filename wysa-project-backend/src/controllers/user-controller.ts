import { Request, response, Response } from "express";
import { User } from "../models/user-models";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import { UserServiceModel, LoginDTO, RegisterUserServiceMode } from "../dto/user-dto";
import { UserService } from "../services/user-service";

export class UserController {

    static async register(req: Request, res: Response): Promise<void> {
        try{
            const userRegister = req.body as RegisterUserServiceMode;
            const user = await UserService.createUser(userRegister)

            if(!user){
                res.status(409).send("User already exists");
                return;
            }
            res.status(201).send(user);
        }
        catch(err){
            res.status(500).send("Internal Server Error");
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try{
            const userLogin = req.body as LoginDTO;

            const userToken = await UserService.login(userLogin)

            if(!userToken){
                res.status(404).send("Invliad username or password");
                return;
            }
            res.status(200).send(userToken);
        } 
        catch(err){
            res.status(500).send("Internal Server Error");
        }
    }
}