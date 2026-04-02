export interface QuestionServiceModel{
    id:string,
    module:string,
    text:string,
    options: Array<OptionServiceModel>
}
export interface OptionServiceModel{
    text: string;
    optionId:string,
}

export interface AnswerServiceModel{
    questionId: string,
    module:string,
    selectOption: OptionServiceModel
}