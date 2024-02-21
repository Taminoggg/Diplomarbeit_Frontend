import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditCheckStepDto, StepDto, StepsService } from '../shared/swagger';
import { TranslocoModule } from '@ngneat/transloco';
import { NgSignalDirective } from '../shared/ngSignal.directive';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-checklist-pop-up',
  standalone: true,
  imports: [CommonModule, TranslocoModule, NgSignalDirective, ReactiveFormsModule ],
  templateUrl: './checklist-pop-up.component.html',
  styleUrl: './checklist-pop-up.component.scss'
})
export class ChecklistPopUpComponent {

  stepsService = inject(StepsService);
  isCompleted = signal(false);
  steps = signal<StepDto[]>([]);
  myForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data:any, private fb: FormBuilder) {
    this.stepsService.stepsIdGet(data.id)
    .subscribe(steps => {
      this.steps.set(steps);
      steps.forEach(step => this.addArticle(step.id, step.isCompleted, step.stepName, step.stepDescription));
    } );

    this.myForm = this.fb.group({
      steps: this.fb.array([])
    });
  }

  saveChecklist(){
    for (let i = 0; i < this.stepsFormArray.length; i++) {
      let checkStep:EditCheckStepDto = {
        isCompleted: this.getFormGroup(i).get('isCompleted')!.value,
        id: this.getFormGroup(i).get('id')!.value
      }
      console.log(checkStep);
  
       this.stepsService.stepsCompleteStepPut(checkStep)
       .subscribe(x => console.log(x));
    }
  }

  get stepsFormArray() {
    return this.myForm.get('steps') as FormArray;
  }

  addArticle(id:number, isCompleted:boolean, stepname:string, stepdescription:string) {
    const stepGroup = this.fb.group({
      isCompleted:[isCompleted],
      id: [id],
      stepname: [stepname],
      stepdescription: [stepdescription]
    });

    this.stepsFormArray.push(stepGroup);
  }

  getFormGroup(index: number): FormGroup {
    return this.stepsFormArray.at(index) as FormGroup;
  }

  saveSteps() {
    const steps = this.myForm.value.steps;
    console.log('Entered steps:', steps);
  }
}
