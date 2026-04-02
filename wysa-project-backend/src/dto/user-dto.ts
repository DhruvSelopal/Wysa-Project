export interface LoginDTO {
    email: string;
    password: string;
}

export interface UserServiceModel{
    id:string
    email: string;
    name: string;
    birthdate: Date;
    age: number;
}

export interface RegisterUserServiceMode{
    email: string;
    name: string;
    birthdate: Date;
    age: number;
    password:string
}