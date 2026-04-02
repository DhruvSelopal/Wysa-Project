
import { QARepoistory } from "../repoistory/qa-repoistory";
import { UserStateService, PersonalityResult } from "./user-state-service";
import { MongoQuestion, Question } from "../models/qa-models";
import { AnswerServiceModel, QuestionServiceModel } from "../dto/qa-dto";


export class QAService{
    static startTest = async (userId:string): Promise<boolean | null> =>{
        const firstQuestion = QARepoistory.getFirstQuestion();
        if(!firstQuestion) return null;

        const createStateResponse = await UserStateService.createUserState(userId,firstQuestion._id);
        if(!!createStateResponse) return true;
        return null;
    }

    static getQuestion = async (questionId : string,userId:string): Promise<QuestionServiceModel | null> =>{
        const isQuestionValidResponse = await UserStateService.isRequestedQuestionValid(questionId,userId);
        if(isQuestionValidResponse === null || isQuestionValidResponse === false) return null;

        let question:MongoQuestion | null;
        if(isQuestionValidResponse === true) question = QARepoistory.getQuestion(questionId);
        else question = QARepoistory.getQuestion(isQuestionValidResponse);

        if(!!question) return QAService.mapMongoQuestionToServiceModel(question);
        return null;
    }

    static getNextQuestion = async (userId:string) :Promise<QuestionServiceModel | null> =>{
        const nextQuestionId  = await UserStateService.getNextQuestionId(userId);

        if(!nextQuestionId) return null;
        const nextQuestion = QARepoistory.getQuestion(nextQuestionId);
        if(!nextQuestion) return null;
        return QAService.mapMongoQuestionToServiceModel(nextQuestion);
    }

    static answerQuestion = async (answer:AnswerServiceModel,userId:string) : Promise<null | boolean | "done"> =>{
        const isRequestedQuestionValid = await UserStateService.isRequestedQuestionValid(answer.questionId,userId);

        if(!isRequestedQuestionValid) return null;

        const question = QARepoistory.getQuestion(answer.questionId);
        if(!question) return null;
        const selectedOption = question?.options.find(option => answer.selectOption.optionId === option.optionId);
        if(!selectedOption) return null;

        const response =  await UserStateService.updateUserState(userId,question._id.toString(),question.module,selectedOption);
        return response;
    }

    static getFinalResult = async (userId:string):Promise<PersonalityResult | null>  =>{
        const res = await UserStateService.getFinalResult(userId);
        return res;
    }

    private static mapMongoQuestionToServiceModel = (question:MongoQuestion):QuestionServiceModel =>{
        const questionToReturn:QuestionServiceModel = {
            id: question._id.toString(),
            text:question.text,
            module: question.module,
            options: question.options
        }
        return questionToReturn
    }
}