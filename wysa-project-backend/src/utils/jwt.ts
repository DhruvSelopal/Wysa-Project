import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
    const payload :JwtPayload = {userId:userId};
    return jwt.sign(payload, SECRET! , { expiresIn: "1h" });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, SECRET!);
};

export const getUserId = (token:string): string | null =>{
    try{
        const decoded = jwt.verify(token,SECRET!);
        if(decoded === Object && decoded !== null){
            return decoded.userId;
        }
        return null;
    }
    catch(err){
        return null;
    }
}