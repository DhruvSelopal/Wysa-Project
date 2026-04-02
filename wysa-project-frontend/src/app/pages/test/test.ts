import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { QaService } from '../../services/qa.service';
import { Question, AnsweredQuestion, AnswerRequest } from '../../models/qa.models';

const MAX_QUESTIONS = 15;

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.css'
})
export class TestComponent implements OnInit {
  // ── State ──
  currentQuestion = signal<Question | null>(null);
  selectedOptionId = signal<string | null>(null);
  viewingHistoryIndex = signal<number | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  answeredQuestions: AnsweredQuestion[] = [];

  // ── Computed ──
  displayQuestion = () => {
    const idx = this.viewingHistoryIndex();
    if (idx !== null) {
      return this.answeredQuestions[idx]?.question ?? null;
    }
    return this.currentQuestion();
  };

  questionNumber = () => {
    const idx = this.viewingHistoryIndex();
    if (idx !== null) return idx + 1;
    return this.answeredQuestions.length + 1;
  };

  progressPercent = () =>
    Math.min((this.questionNumber() / MAX_QUESTIONS) * 100, 100);

  canGoBack = () => {
    const idx = this.viewingHistoryIndex();
    if (idx !== null) return idx > 0;
    return this.answeredQuestions.length > 0;
  };

  canSubmit = computed(() => !!this.selectedOptionId() && !this.isLoading());

  isViewingHistory = computed(() => this.viewingHistoryIndex() !== null);

  constructor(private qaService: QaService, private router: Router) {}

  ngOnInit(): void {
    const q = this.qaService.getCurrentQuestion();
    if (q) {
      this.currentQuestion.set(q);
    } else {
      this.router.navigate(['/home']);
    }
  }

  selectOption(optionId: string): void {
    this.selectedOptionId.set(optionId);
    this.error.set(null);
  }

  goPrevious(): void {
    const idx = this.viewingHistoryIndex();

    if (idx !== null) {
      if (idx > 0) {
        const newIdx = idx - 1;
        this.viewingHistoryIndex.set(newIdx);
        this.selectedOptionId.set(this.answeredQuestions[newIdx]?.selectedOptionId ?? null);
      }
    } else {
      const len = this.answeredQuestions.length;
      if (len > 0) {
        const newIdx = len - 1;
        this.viewingHistoryIndex.set(newIdx);
        this.selectedOptionId.set(this.answeredQuestions[newIdx]?.selectedOptionId ?? null);
      }
    }
  }

  submitAnswer(): void {
    const optionId = this.selectedOptionId();
    if (!optionId) {
      this.error.set('Please select an option before continuing.');
      return;
    }

    const idx = this.viewingHistoryIndex();
    const question = idx !== null
      ? this.answeredQuestions[idx]?.question
      : this.currentQuestion();

    if (!question) return;

    // Rollback history if re-answering a previous question
    if (idx !== null) {
      this.answeredQuestions = this.answeredQuestions.slice(0, idx);
    }

    this.isLoading.set(true);
    this.error.set(null);

    const answerReq: AnswerRequest = {
      questionId: question.id,
      module: question.module,
      selectOption: { optionId }
    };

    this.qaService.answerQuestion(answerReq).subscribe({
      next: (res) => {
        this.answeredQuestions.push({ question, selectedOptionId: optionId });
        this.viewingHistoryIndex.set(null);
        this.selectedOptionId.set(null);
        this.isLoading.set(false);

        const isDone =
          res.message === 'done' || this.answeredQuestions.length >= MAX_QUESTIONS;

        if (isDone) {
          this.router.navigate(['/result']);
        } else if (res.nextQuestion) {
          this.currentQuestion.set(res.nextQuestion);
          this.qaService.setCurrentQuestion(res.nextQuestion);
        } else {
          this.router.navigate(['/result']);
        }
      },
      error: () => {
        this.error.set('Failed to submit answer. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
