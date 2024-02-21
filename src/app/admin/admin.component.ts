import { Component, OnInit, inject, signal } from '@angular/core';
import { AddChecklistDto, AddStepDto, ChecklistDto, ChecklistsService, StepDto, StepsService } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';
import { TranslocoModule } from '@ngneat/transloco';
import { EditStepDto } from '../shared/swagger/model/editStepDto';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgSignalDirective, TranslocoModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  ngOnInit(): void {
    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => this.allChecklists.set(x));
  }


  checklistService = inject(ChecklistsService);
  stepService = inject(StepsService);

  allChecklists = signal<ChecklistDto[]>([]);
  allStepsForChecklist = signal<StepDto[]>([]);
  selectedChecklistId: number = -1;
  checklistName = signal('');
  stepNumber = signal(1);
  stepName = signal('Name1');
  stepDescription = signal('Desc1');

  showStepsForChecklist(id: number) {
    if (this.selectedChecklistId === id) {
      this.selectedChecklistId = -1;
      this.allStepsForChecklist.set([]);
    } else {
      this.selectedChecklistId = id;
      this.stepService.stepsIdGet(id)
        .subscribe(x => this.allStepsForChecklist.set(x));
    }
  }

  editStep(id:number) {
    let editStepDto: EditStepDto = {
      id: id,
      stepNumber: this.stepNumber(),
      stepDescription: this.stepDescription(),
      stepName: this.stepName()
    };

    this.stepService.stepsPut(editStepDto)
    .subscribe(x => this.stepService.stepsIdGet(this.selectedChecklistId)
      .subscribe(x => this.allStepsForChecklist.set(x)));
  }

  postStep() {
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
      checklistname: this.checklistName(),
      generatedByAdmin: true
    }

    this.checklistService.checklistsPost(checklistDto)
      .subscribe(x => this.checklistService.checklistsGet()
        .subscribe(x => this.allChecklists.set(x)));

    this.checklistName.set('');
  }
}
