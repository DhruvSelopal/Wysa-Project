import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgStyle } from '@angular/common';
import { QaService } from '../../services/qa.service';
import { PersonalityResult, ModuleScore } from '../../models/qa.models';

const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
  social_energy:       { label: 'Social Energy',       icon: '🌐' },
  introspection:       { label: 'Introspection',        icon: '🔍' },
  emotional_stability: { label: 'Emotional Stability',  icon: '⚖️' },
  logic:               { label: 'Logic',                icon: '🧠' },
  confidence:          { label: 'Confidence',           icon: '🦋' },
  discipline:          { label: 'Discipline',           icon: '🎯' },
  openness:            { label: 'Openness',             icon: '🌱' },
  leadership:          { label: 'Leadership',           icon: '⚡' },
  empathy:             { label: 'Empathy',              icon: '💛' },
  adaptability:        { label: 'Adaptability',         icon: '🧭' },
};

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, NgStyle],
  templateUrl: './result.html',
  styleUrl: './result.css'
})
export class ResultComponent implements OnInit {
  isLoading = signal(true);
  error = signal<string | null>(null);
  result = signal<PersonalityResult | null>(null);

  constructor(private qaService: QaService, private router: Router) {}

  ngOnInit(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.qaService.getResult().subscribe({
      next: (res) => {
        this.result.set(res.result);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Could not fetch your result. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  getModuleLabel(mod: string): string {
    return MODULE_LABELS[mod]?.label ?? mod.replace(/_/g, ' ');
  }

  getModuleIcon(mod: string): string {
    return MODULE_LABELS[mod]?.icon ?? '✦';
  }

  isTopModule(mod: string): boolean {
    return this.result()?.topModules.includes(mod) ?? false;
  }

  retakeTest(): void {
    this.qaService.clearState();
    this.router.navigate(['/home']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
