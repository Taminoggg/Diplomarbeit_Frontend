import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StepDto, StepsService } from '../shared/swagger';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-checklist-pop-up',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './checklist-pop-up.component.html',
  styleUrl: './checklist-pop-up.component.scss'
})
export class ChecklistPopUpComponent {

  stepsService = inject(StepsService);
  steps = signal<StepDto[]>([]);

  constructor(@Inject(MAT_DIALOG_DATA) public data:any){
    this.stepsService.stepsIdGet(data.id)
    .subscribe(x => this.steps.set(x));
  }

  saveChecklist(){
     

    this.stepsService.stepsPost()
    .subscribe(_ => console.log(_));
  }
}
