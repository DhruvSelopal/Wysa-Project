import { Response } from "express";
import { AuthRequest } from "../middleware/auth-middleware";
import { AnswerServiceModel } from "../dto/qa-dto";
import { QAService } from "../services/qa-service";
import { UserService } from "../services/user-service";

export class QAController {
    static startTest = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const started = await QAService.startTest(userId);
            if (!started) {
                res.status(400).json({ message: "Could not start test" });
                return;
            }

            const question = await QAService.getNextQuestion(userId);

            res.status(200).json({
                message: "Test started",
                question
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to start test" });
        }
    };

    static getQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const questionId = req.body?.questionId as string | undefined;
            if (!questionId) {
                res.status(400).json({ message: "questionId is required" });
                return;
            }

            const question = await QAService.getQuestion(questionId, userId);
            if (!question) {
                res.status(404).json({ message: "Question not found or not allowed" });
                return;
            }

            res.status(200).json({
                message: "Question fetched",
                question
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch question" });
        }
    };

    static getNextQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const question = await QAService.getNextQuestion(userId);
            if (!question) {
                res.status(404).json({ message: "No next question available" });
                return;
            }

            res.status(200).json({
                message: "Next question fetched",
                question
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch next question" });
        }
    };

    static answerQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const answer = req.body as AnswerServiceModel;

            if (!answer?.questionId || !answer?.module || !answer?.selectOption?.optionId) {
                res.status(400).json({ message: "Invalid answer payload" });
                return;
            }

            const result = await QAService.answerQuestion(answer, userId);
            if (!result) {
                res.status(400).json({ message: "Could not submit answer" });
                return;
            }
            if(result == "done"){
                res.status(200).json({message:"done"});
                return;
            }

            const nextQuestion = await QAService.getNextQuestion(userId);

            res.status(200).json({
                message: "Answer submitted",
                nextQuestion
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to submit answer" });
        }
    };

    static finishTest = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const result = await QAService.getFinalResult(userId);
            if(!result){
                res.status(404).json({message:"Bad request"});
                return;
            }

            res.status(200).json({ result });
        } catch (error) {
            res.status(500).json({ message: "Failed to finish test" });
        }
    };
}