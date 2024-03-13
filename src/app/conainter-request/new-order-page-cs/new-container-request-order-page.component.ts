import { ChangeDetectorRef, Component, computed, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticleCRDto, AddCsinquiryDto, AddOrderDto, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, OrdersService, TlinquiriesService, AddChecklistDto, StepsService, AddStepDto, ArticlesCRService } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ValidationService } from '../../shared/validation.service';
import { EditService } from '../../edit.service';

@Component({
  selector: 'app-new-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-container-request-order-page.component.html',
  styleUrl: './new-container-request-order-page.component.scss'
})
export class NewContainerOrderPageComponent implements OnInit {
  ngOnInit(): void {
    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => {
        this.allCheckliststs.set(x);
        this.editService.checklistId.set(this.allCheckliststs().first().id);
      });

    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });

    this.editService.navigationPath = '/container-request-page/containerRequestCS';
    this.addArticle();
  }

  myForm!: FormGroup;
  dataService: any;
  router = inject(Router);
  fb = inject(FormBuilder);
  orderService = inject(OrdersService);
  stepsService = inject(StepsService);
  validationService = inject(ValidationService);
  checklistService = inject(ChecklistsService);
  editService = inject(EditService);
  csInquiryService = inject(CsinquiriesService);
  articlesCRService = inject(ArticlesCRService);
  tlInquiryService = inject(TlinquiriesService);
  cdr = inject(ChangeDetectorRef);

  allCheckliststs = signal<ChecklistDto[]>([]);

  //CsData
  container = signal('Test');
  abnumber = signal(1);
  grossWeightInKg = signal(1);
  incoterm = signal('Test');
  containersizeA = signal(1);
  containersizeB = signal(1);
  containersizeHc = signal(1);
  readyToLoad = signal('17.12.2023');
  loadingPlattform = signal('Test');
  fastLine = signal(false);
  directLine = signal(false);

  isReadyToLoadValid = computed(() => this.validationService.isDateValid(this.readyToLoad()));
  isIncotermValid = computed(() => this.validationService.isAnyInputValid(this.incoterm()));
  isLoadingPlattfromValid = computed(() => this.validationService.isAnyInputValid(this.readyToLoad()));
  isCustomerValid = computed(() => this.validationService.isNameStringValid(this.editService.customerName()));
  isCreatedByValid = computed(() => this.validationService.isNameStringValid(this.editService.createdByCS()));
  isAbNumberValid = computed(() => this.validationService.isNumberValid(this.abnumber()));
  isGrossWeightInKgValid = computed(() => this.validationService.isNumberValid(this.grossWeightInKg()));
  isContainerSizeAValid = computed(() => this.containersizeA() >= 0);
  isContainerSizeBValid = computed(() => this.containersizeB() >= 0);
  isContainerSizeHcValid = computed(() => this.containersizeHc() >= 0);
  areArticleNumbersValid = signal<boolean>(true);
  isAllValid = computed(() => {
    return (
      this.isReadyToLoadValid() &&
      this.isIncotermValid() &&
      this.isCustomerValid() &&
      this.isLoadingPlattfromValid() &&
      this.isCreatedByValid() &&
      this.isAbNumberValid() &&
      this.isGrossWeightInKgValid() &&
      this.isContainerSizeAValid() &&
      this.isContainerSizeBValid() &&
      this.isContainerSizeHcValid() &&
      this.areArticleNumbersValid()
    );
  });

  setAreArticleNumbersValid() {
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (this.getFormGroup(i).get('articleNumber')!.value < 1) {
        this.areArticleNumbersValid.set(false);
        return;
      }

      if ((this.fastLine() === true && this.getFormGroup(i).get('palletAmount')!.value < 1) || (this.directLine() === true && this.getFormGroup(i).get('palletAmount')!.value < 1)) {
        this.areArticleNumbersValid.set(false);
        return;
      }
    }
    this.areArticleNumbersValid.set(true);
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle() {
    const articleGroup = this.fb.group({
      articleNumber: [1, Validators.required],
      palletAmount: [1, Validators.required],
      directline: [false],
      fastLine: [false],
      additonalInformation: [''],
      minHeigthRequired: [1, Validators.required],
      desiredDeliveryDate: [''],
      inquiryForFixedOrder: [''],
      inquiryForQuotation: ['']
    });

    this.articlesFormArray.push(articleGroup);
    this.setAreArticleNumbersValid();
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  removeArticle(index: number) {
    this.articlesFormArray.removeAt(index);
    this.setAreArticleNumbersValid();
  }

  saveArticles() {
    const articles = this.myForm.value.articles;
    console.log('Entered Articles:', articles);
  }

  @Output() freeDurationSelected = new EventEmitter<number>();
  @Output() thcSelected = new EventEmitter<boolean>();
  durations = [10, 14, 21, 0];
  thcs = [true, false];
  selectedThc: boolean;
  freeDetention: number;

  constructor() {
    this.freeDetention = this.durations[0];
    this.selectedThc = this.thcs[0];
    this.emitDuration();
  }

  emitThcs() {
    this.thcSelected.emit(this.selectedThc);
  }

  emitDuration() {
    this.freeDurationSelected.emit(this.freeDetention);
  }

  saveOrder(): void {
    console.log('saving order');

    let csInquiry: AddCsinquiryDto = {
      container: this.container(),
      abnumber: this.abnumber(),
      bruttoWeightInKg: this.grossWeightInKg(),
      incoterm: this.incoterm(),
      containersizeA: this.containersizeA(),
      containersizeB: this.containersizeB(),
      containersizeHc: this.containersizeHc(),
      freeDetention: this.freeDetention,
      thctb: this.selectedThc,
      readyToLoad: this.readyToLoad(),
      loadingPlattform: this.loadingPlattform(),
      isDirectLine: this.directLine(),
      isFastLine: this.fastLine()
    };

    this.csInquiryService.csinquiriesPost(csInquiry)
      .subscribe(csInquiryObj => {
        for (let i = 0; i < this.articlesFormArray.length; i++) {
          let article: AddArticleCRDto = {
            pallets: this.getFormGroup(i).get('palletAmount')!.value,
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            csInquiryId: csInquiryObj.id
          };
          console.log(article);

          this.articlesCRService.articlesCRPost(article).subscribe(x =>
            console.log('article posted: ' + x.id)
          );
        }

        console.log('posting tlInquiry');

        this.tlInquiryService.tlinquiriesPost()
          .subscribe(tlInquiryObj => {
            let order: AddOrderDto;

            let checklistDto: AddChecklistDto = {
              id: this.editService.checklistId(),
              generatedByAdmin: false,
              checklistname: this.allCheckliststs().single(x => x.id == this.editService.checklistId()).checklistname
            }

            this.checklistService.checklistsPost(checklistDto)
              .subscribe(currChecklist => {
                console.log('customerName:');
                console.log(this.editService.customerName());
                console.log(this.editService.createdByCS());
                if (this.editService.additonalInformation() === '') {
                  order = {
                    customerName: this.editService.customerName(),
                    createdBy: this.editService.createdByCS(),
                    checklistId: currChecklist.id,
                    csId: csInquiryObj.id,
                    tlId: tlInquiryObj.id
                  };
                } else {
                  order = {
                    customerName: this.editService.customerName(),
                    createdBy: this.editService.createdByCS(),
                    checklistId: this.editService.checklistId(),
                    csId: csInquiryObj.id,
                    tlId: tlInquiryObj.id,
                    additionalInformation: this.editService.additonalInformation()
                  };
                }

                console.log('Checklist:');
                console.log(currChecklist.checklistname);
                console.log(currChecklist.id);

                this.stepsService.stepsIdGet(currChecklist.id)
                  .subscribe(x => x.forEach(x => console.log(x)));

                this.stepsService.stepsIdGet(this.editService.checklistId())
                  .subscribe(checklistArray => checklistArray.forEach(step => {
                    let addStepDto: AddStepDto = {
                      stepNumber: step.stepNumber!,
                      stepName: step.stepName!,
                      stepDescription: step.stepDescription!,
                      checklistId: currChecklist.id
                    };
                    console.log('Step to add to checklist:');
                    console.log(addStepDto);
                    this.stepsService.stepsPost(addStepDto)
                      .subscribe(() => console.log('new steps posted'));
                  }));

                this.orderService.ordersPost(order)
                  .subscribe(x => this.editService.navigateToPath());
              });
          });
      });
  }
}