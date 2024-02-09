import { Component, OnInit, inject, signal } from '@angular/core';
import { AddChecklistDto, AddStepDto, ChecklistDto, ChecklistsService, StepDto, StepsService } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgSignalDirective, TranslocoModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  ngOnInit(): void {
    this.checklistService.checklistsGet()
      .subscribe(x => this.allChecklists.set(x));
  }

  
  checklistService = inject(ChecklistsService);
  stepService = inject(StepsService);


  allChecklists = signal<ChecklistDto[]>([]);
  allStepsForChecklist = signal<StepDto[]>([]);
  selectedChecklistId: number = -1;
  checklistName = signal('');
  stepNumber = signal(1);
  stepName = signal('');
  stepDescription = signal('');

  editChecklist(id: number) {
    if (this.selectedChecklistId === id) {
      this.selectedChecklistId = -1;
      this.allStepsForChecklist.set([]);
    } else {
      this.selectedChecklistId = id;
      this.stepService.stepsIdGet(id)
        .subscribe(x => this.allStepsForChecklist.set(x));
    }
  }

  postStep(){
    console.log(this.stepNumber());
    console.log(this.selectedChecklistId);
    console.log(this.stepDescription());
    console.log(this.stepName());

    let stepDto: AddStepDto = {
      stepNumber: this.stepNumber(),
      checklistId: this.selectedChecklistId,
      stepDescription: this.stepDescription(),
      stepName: this.stepName()
    };
    
    this.stepService.stepsPost(stepDto)
    .subscribe(x => this.stepService.stepsIdGet(this.selectedChecklistId)
    .subscribe(x => this.allStepsForChecklist.set(x)));
  }

  postChecklist() {
    let checklistDto: AddChecklistDto = {
      checklistname: this.checklistName()
    }

    this.checklistService.checklistsPost(checklistDto)
      .subscribe(x => this.checklistService.checklistsGet()
        .subscribe(x => this.allChecklists.set(x)));

    this.checklistName.set('');
  }
}
