import { ModulesArray } from "../app.const";
import { IQuestion, MongoQuestion, Question } from "../models/qa-models";
import mongoose, { Types } from "mongoose";

export class QARepoistory{
    private static questions: Map<string,Map<string,MongoQuestion>> = new Map(); // module questions mapping;
    
    static initialize = async () =>{
      const allQuestions = await Question.find();


      for(let module of ModulesArray){
        const questionsForModule: Array<IQuestion> = allQuestions.filter(x =>
            x.module === module
        );
        const innerMap = new Map<string, MongoQuestion>(
        questionsForModule.map(q => [q._id.toString(), q] as [string, MongoQuestion])
        );
        QARepoistory.questions.set(module,innerMap);
      }

    }

    static getNextQuestion = (moduleName:string,usedQuestions: Map<string,boolean>)
                : IQuestion | null | "done" =>
    {
        var questions = QARepoistory.questions.get(moduleName);
        if(!questions) return null;
        if(questions.size === usedQuestions.size) return "done";
        for(let [key,value] of questions.entries()){
            var uesdQuestion = usedQuestions.get(key);
            if(!uesdQuestion) return value;
        }
        return null;
    }

    static getQuestion = (questionId:string) : MongoQuestion | null  =>{
        for(let [key,value] of QARepoistory.questions.entries()){
            var question = value.get(questionId);
            if(question) return question;
        }
        return null;
    }

    static getFirstQuestion = ():MongoQuestion | null =>{
        let modulelength = ModulesArray.length;
        let randomModule : string = ModulesArray[Math.floor(Math.random()*modulelength)]!;
        var questionsMap = QARepoistory.questions.get(randomModule);

        if(questionsMap){

            var keysArray = Array.from(questionsMap.keys());
            var questionId = keysArray[0]!;
            var question = questionsMap.get(questionId);
            if(question) return question
            return null; 
        }
       return null;
    }
}