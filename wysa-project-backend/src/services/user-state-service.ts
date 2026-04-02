import { Types } from "mongoose";
import { ModulesArray } from "../app.const";
import { IOption, IQuestion } from "../models/qa-models";
import { UserState,Answer, moduleAndQuestionsAnswered, MongoUserState } from "../models/user-state-models";
import { QARepoistory } from "../repoistory/qa-repoistory";

export interface ModuleScore {
    module: string;
    score: number;
    percentage: number;
}

export interface PersonalityResult {
    archetype: string;
    emoji: string;
    tagline: string;
    description: string;
    traits: string[];
    topModules: string[];
    moduleScores: ModuleScore[];
    primaryColor: string;
    secondaryColor: string;
}



export class UserStateService{
    // initialize state
    static createUserState = async (userId:string,firstQuestionId:Types.ObjectId):Promise<boolean> =>{
        try{
            const userState = await UserState.findOne({userId:userId});
            if(!!userState){
                await userState.deleteOne({userId:userId});
            }
            
            const moduleScores = new Map<string,number>(
                                    ModulesArray.map(key => [key, 0])
                                );

            const addUserState = await UserState.create({
                userId:userId,
                currentQuestionId: firstQuestionId,
                moduleScores: moduleScores,
                answers: [],
                isCompleted:false
            });
            return true;
        }
        catch(err){
            return false;
        }
    }

    // Verify if requested question is valid , if its not return the current question
    static isRequestedQuestionValid = async (questionId:string,userId:string)
                                    : Promise<boolean | null | string> =>{
        try{
            const userState = await UserState.findOne({userId:userId});
            if(!!userState){
                if(userState.currentQuestionId.toString() === questionId) return true;
                const answers: Answer[] | null = userState.answers;
                if(!!answers){
                    const isQuestionValid =  answers.find(ans => ans.questionId.toString() === questionId);
                    if(!isQuestionValid) return userState.currentQuestionId.toString();
                    else return true; 
                } 
            }
            return null;
        }
        catch(err){
            return null;
        }
    }

    // data to get next Question , this will be send to repoistory via qa service
    static getNextModuleAndItsAnsweredQuestions = async (userId:string) : Promise<moduleAndQuestionsAnswered|null> =>{
        try{
            const userState = await UserState.findOne({userId:userId});
            if(!userState) return null;

            const scores = userState.moduleScores;

            const module = this.calculateNextModule(scores);
            const questionsAnswered = userState.answers
            .filter(ans => ans.questionModule === module)
            .map(ans => ans.questionId.toString());

            const moduleAndQuestionsAnswered:moduleAndQuestionsAnswered = {
                module: module,
                questions:questionsAnswered
            }
            return moduleAndQuestionsAnswered;
        }
        catch(err){
            return null
        }
    }

    // getting next question id stored in state
    static getNextQuestionId = async (userId:string):Promise<string | null> => {
        const userState = await UserState.findOne({userId:userId});
        if(!userState) return null;
        return userState.currentQuestionId.toString();
    }

    // updating state once the question is answered have to reconcile if the answer is from previous question
    static updateUserState = 
        async (userId:string,questionId:string,questionModule:string,
            selectedOption:IOption): Promise<boolean | null | "done"> =>
    {
        try{
            const userState = await UserState.findOne({userId:userId});
            if(!userState) return null;

            if(userState.currentQuestionId.toString() === questionId){
                const res = await UserStateService.updateStateForCurrentQuestion(userState,questionId,questionModule,selectedOption);
                return res;
            }
            else{
                const res = await UserStateService.updateStateForHistoryQuestion(userState,questionId,selectedOption);
                return res;
            }
        }
        catch(err){
            return null;
        }
    }

    static getFinalResult = async (userId:string):Promise<PersonalityResult | null> =>{
        const userState = await UserState.findOne({userId:userId});
        if(!userState) return null;
        const scores = userState.moduleScores;
        return UserStateService.computePersonality(scores);
    }

    private static computePersonality = (moduleScores: Map<string, number>): PersonalityResult => {
        // Convert scores to array and sort descending
        const scoreEntries: Array<[string, number]> = [];
        for (const [key, val] of moduleScores) {
            scoreEntries.push([key, val]);
        }
        scoreEntries.sort((a, b) => b[1] - a[1]);

        // Normalize: find max possible per module (2 questions × max weight ≈ 4–6)
        const RAW_MAX = 8; // practical ceiling for per-module raw score
        const moduleScoreList: ModuleScore[] = scoreEntries.map(([mod, score]) => ({
            module: mod,
            score,
            percentage: Math.min(100, Math.max(0, Math.round(((score + RAW_MAX) / (RAW_MAX * 2)) * 100)))
        }));

        const top3 = scoreEntries.slice(0, 3).map(e => e[0]);
        const top1 = top3[0] ?? "adaptability";
        const top2 = top3[1] ?? "openness";

        // Archetype table: keyed by top-module pair
        const archetypeMap: Record<string, { archetype: string; emoji: string; tagline: string; description: string; traits: string[]; primaryColor: string; secondaryColor: string }> = {
            "social_energy+confidence": {
                archetype: "The Magnetic Leader",
                emoji: "🌟",
                tagline: "You light up every room you enter",
                description: "You thrive in social settings and carry a natural confidence that draws others to you. Your energy is infectious, and people instinctively look to you for direction. You lead not through authority but through genuine presence and enthusiasm.",
                traits: ["Charismatic", "Self-assured", "Inspiring", "Socially fluent", "Action-oriented"],
                primaryColor: "#f59e0b",
                secondaryColor: "#ef4444"
            },
            "social_energy+empathy": {
                archetype: "The Social Healer",
                emoji: "🤝",
                tagline: "Connections are your superpower",
                description: "You have a rare gift — you are both energized by people and deeply attuned to their feelings. You create spaces where others feel safe and heard. Your emotional intelligence and outward warmth make you an irreplaceable force in any group.",
                traits: ["Warm", "Perceptive", "Inclusive", "Engaging", "Compassionate"],
                primaryColor: "#ec4899",
                secondaryColor: "#a78bfa"
            },
            "social_energy+leadership": {
                archetype: "The Energizing Commander",
                emoji: "⚡",
                tagline: "You move people and ideas forward",
                description: "You combine social dynamism with a natural talent for guiding others. Where others see chaos, you see opportunity to organize and rally. You are at your best when leading a team toward a shared vision with energy and decisiveness.",
                traits: ["Bold", "Persuasive", "Decisive", "Team-oriented", "Visionary"],
                primaryColor: "#f97316",
                secondaryColor: "#eab308"
            },
            "introspection+empathy": {
                archetype: "The Empathic Sage",
                emoji: "🌊",
                tagline: "You understand what words cannot say",
                description: "You possess a profound inner life matched by a deep sensitivity to others. Your reflective nature allows you to process complex emotions — your own and those around you — with rare wisdom. People trust you with their truths because you listen without judgment.",
                traits: ["Deeply empathetic", "Reflective", "Wise", "Intuitive", "Trustworthy"],
                primaryColor: "#06b6d4",
                secondaryColor: "#6366f1"
            },
            "introspection+emotional_stability": {
                archetype: "The Calm Observer",
                emoji: "🌙",
                tagline: "Still waters run deep",
                description: "You combine thoughtful self-reflection with an impressive emotional steadiness. You rarely react impulsively — instead, you process deeply and respond with quiet clarity. Your grounded presence is a stabilizing force for those around you.",
                traits: ["Grounded", "Introspective", "Measured", "Self-aware", "Steady"],
                primaryColor: "#8b5cf6",
                secondaryColor: "#06b6d4"
            },
            "introspection+openness": {
                archetype: "The Philosophical Explorer",
                emoji: "🔭",
                tagline: "Your mind is always seeking the horizon",
                description: "You are endlessly curious about the world within and around you. Introspection fuels your openness — every new idea or experience becomes material for deep contemplation. You are a natural philosopher, always questioning, always growing.",
                traits: ["Curious", "Creative", "Deep thinker", "Open-minded", "Self-questioning"],
                primaryColor: "#10b981",
                secondaryColor: "#8b5cf6"
            },
            "emotional_stability+discipline": {
                archetype: "The Unshakeable Builder",
                emoji: "🏔️",
                tagline: "Consistent. Composed. Unstoppable.",
                description: "You are the bedrock that others lean on. Your emotional resilience and disciplined approach to life mean you show up reliably — in good times and hard ones. You build things that last, both projects and relationships, through sheer steadfastness.",
                traits: ["Reliable", "Composed", "Hardworking", "Structured", "Resilient"],
                primaryColor: "#64748b",
                secondaryColor: "#0ea5e9"
            },
            "emotional_stability+adaptability": {
                archetype: "The Resilient Navigator",
                emoji: "🧭",
                tagline: "Change is where you thrive",
                description: "You possess an extraordinary ability to stay steady while the world around you shifts. Change does not rattle you — it reveals your best self. You adapt fluidly, recover quickly, and help others find their footing when things get uncertain.",
                traits: ["Flexible", "Calm under pressure", "Adaptive", "Optimistic", "Resourceful"],
                primaryColor: "#0ea5e9",
                secondaryColor: "#10b981"
            },
            "logic+discipline": {
                archetype: "The Precision Architect",
                emoji: "⚙️",
                tagline: "You build systems that actually work",
                description: "You think in systems and act with purpose. Your analytical mind and disciplined follow-through make you exceptionally effective at turning complex problems into elegant solutions. You believe in doing things right — not just doing them fast.",
                traits: ["Analytical", "Methodical", "Precise", "Dependable", "Strategic"],
                primaryColor: "#6366f1",
                secondaryColor: "#0ea5e9"
            },
            "logic+openness": {
                archetype: "The Inventive Thinker",
                emoji: "💡",
                tagline: "Logic with a creative spark",
                description: "You combine rigorous reasoning with a genuine appetite for new ideas. Where others pick one or the other, you synthesize analysis and imagination into something powerful. You are the person who not only spots the problem but designs the breakthrough solution.",
                traits: ["Innovative", "Logical", "Creative", "Curious", "Problem-solver"],
                primaryColor: "#eab308",
                secondaryColor: "#6366f1"
            },
            "confidence+leadership": {
                archetype: "The Bold Visionary",
                emoji: "🚀",
                tagline: "You see the future and step toward it",
                description: "You carry a powerful belief in yourself and in what is possible. Your confidence translates into decisive leadership — you do not wait for permission to act. Others follow you because your conviction is contagious and your direction is clear.",
                traits: ["Assertive", "Visionary", "Decisive", "Courageous", "Inspiring"],
                primaryColor: "#ef4444",
                secondaryColor: "#f97316"
            },
            "adaptability+openness": {
                archetype: "The Free Spirit",
                emoji: "🌿",
                tagline: "You bend without breaking",
                description: "You embrace change and novelty with genuine enthusiasm. New environments energize you; different perspectives fascinate you. You resist rigid definition because you know that growth requires fluidity. You are endlessly adaptable and endlessly interesting.",
                traits: ["Flexible", "Open-minded", "Adventurous", "Curious", "Spontaneous"],
                primaryColor: "#10b981",
                secondaryColor: "#06b6d4"
            },
            "leadership+empathy": {
                archetype: "The People's Champion",
                emoji: "🦁",
                tagline: "You lead with heart, not just mind",
                description: "You understand that true leadership is rooted in understanding people. You lead by listening, empowering, and elevating everyone around you. You build loyal teams not through authority but through genuine care and a compelling sense of shared purpose.",
                traits: ["Empowering", "Emotionally intelligent", "Loyal", "Inspiring", "Collaborative"],
                primaryColor: "#8b5cf6",
                secondaryColor: "#ec4899"
            },
            "discipline+confidence": {
                archetype: "The Focused Achiever",
                emoji: "🎯",
                tagline: "You set the goal. You hit it.",
                description: "You combine fierce self-belief with the discipline to actually follow through. Goals are not wishes to you — they are commitments. Your structured approach and unwavering confidence in your abilities means you regularly achieve what others only plan for.",
                traits: ["Goal-driven", "Disciplined", "Self-motivated", "Persistent", "Confident"],
                primaryColor: "#f59e0b",
                secondaryColor: "#6366f1"
            }
        };

        const key1 = `${top1}+${top2}`;
        const key2 = `${top2}+${top1}`;

        const archetypeData = archetypeMap[key1] ?? archetypeMap[key2] ?? {
            archetype: "The Balanced Explorer",
            emoji: "✨",
            tagline: "A well-rounded mind in a complex world",
            description: "You show a well-rounded personality with strengths distributed across multiple dimensions. You are not defined by any single trait — instead, you bring a versatile blend of thinking, feeling, and acting that makes you adaptable and effective in many different situations.",
            traits: ["Adaptable", "Open-minded", "Versatile", "Curious", "Balanced"],
            primaryColor: "#a78bfa",
            secondaryColor: "#60a5fa"
        };

        return {
            ...archetypeData,
            topModules: top3,
            moduleScores: moduleScoreList
        };
    }

    // calculate next module based on module scores
    private static calculateNextModule = (moduleScores: Map<string,number>):string =>{
        let maxScore = 0;
        let moduleWithHighestScore: string = ModulesArray[0]!;

        for(const [key,value] of moduleScores){
            if(value > maxScore){
                moduleWithHighestScore = key;
                maxScore = value
            }
        }
        return moduleWithHighestScore;
    }

    private static updateStateForHistoryQuestion = async (
        userState: MongoUserState,
        questionId: string,
        selectedOption: IOption
    ): Promise<boolean | "done"> => {
        const index = userState.answers.findIndex(a => a.questionId === questionId);
        if (index === -1) return false;

        userState.answers = userState.answers.slice(0, index+1);

        const moduleScores = UserStateService.rebuildScores(userState.answers);
        userState.set("moduleScores",moduleScores);

        userState.answers.push({
            questionId,
            OptionId: selectedOption.optionId,
            questionModule: userState.answers[index]?.questionModule ?? ""
        });

        const scoresMap = userState.moduleScores;
        const nextModule = UserStateService.calculateNextModule(scoresMap);

        const usedQuestions = new Map<string, boolean>(
            userState.answers
                .filter(a => a.questionModule === nextModule)
                .map(a => [a.questionId, true])
        );

        const nextQuestion = QARepoistory.getNextQuestion(nextModule, usedQuestions);
        if (!nextQuestion) return false;
        if(nextQuestion == "done") return "done";

        userState.currentQuestionId = nextQuestion._id;
        await userState.save();
        return true;
    };

    private static updateStateForCurrentQuestion = async (
        userState: MongoUserState,
        questionId: string,
        questionModule: string,
        selectedOption: IOption
    ): Promise<boolean | "done"> => {
        userState.answers.push({
            questionId,
            OptionId: selectedOption.optionId,
            questionModule
        });

        if (!userState) return false;
        if(!userState.moduleScores) return false;
        const moduleScores = userState.moduleScores;

        for (const [module, weight] of selectedOption.weights) {
            moduleScores.set(
                module,
                (moduleScores.get(module) ?? 0) + weight
            );
        }

        // userState.set("moduleScores",moduleScores);
        // userState.moduleScores = Object.fromEntries(moduleScores);
        // userState.markModified("moduleScores");
        const scoresMap = userState.moduleScores;
        const nextModule = UserStateService.calculateNextModule(scoresMap);

        const usedQuestions = new Map<string, boolean>(
            userState.answers
                .filter(a => a.questionModule === nextModule)
                .map(a => [a.questionId, true])
        );

        const nextQuestion = QARepoistory.getNextQuestion(nextModule, usedQuestions);
        if (!nextQuestion) return false;
        if(nextQuestion === "done") return "done";

        userState.currentQuestionId = nextQuestion._id;
        await userState.save();
        return true;
    };

    private static rebuildScores = (answers: Answer[]) => {
    const scores = new Map<string, number>(ModulesArray.map(m => [m, 0]));

    for (const ans of answers) {
        const question = QARepoistory.getQuestion(ans.questionId);
        if (!question) continue;

        const option = question.options.find(o => o.optionId === ans.OptionId);
        if (!option) continue;

        for (const [module, weight] of option.weights) {
            scores.set(module, (scores.get(module) ?? 0) + weight);
        }
    }

    return scores;
};
}