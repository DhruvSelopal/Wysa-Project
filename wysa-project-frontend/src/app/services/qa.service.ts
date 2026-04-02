import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question, AnswerRequest, StartTestResponse, AnswerResponse, PersonalityResult } from '../models/qa.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QaService {
  private currentQuestionSubject = new BehaviorSubject<Question | null>(null);
  currentQuestion$ = this.currentQuestionSubject.asObservable();

  constructor(private http: HttpClient) {}

  startTest(): Observable<StartTestResponse> {
    return this.http.post<StartTestResponse>(`${environment.apiBaseUrl}/test/start`, {});
  }

  answerQuestion(answer: AnswerRequest): Observable<AnswerResponse> {
    return this.http.post<AnswerResponse>(`${environment.apiBaseUrl}/test/answer`, answer);
  }

  getResult(): Observable<{ result: PersonalityResult }> {
    return this.http.get<{ result: PersonalityResult }>(`${environment.apiBaseUrl}/test/finish`);
  }

  setCurrentQuestion(question: Question): void {
    this.currentQuestionSubject.next(question);
  }

  getCurrentQuestion(): Question | null {
    return this.currentQuestionSubject.getValue();
  }

  clearState(): void {
    this.currentQuestionSubject.next(null);
  }
}
