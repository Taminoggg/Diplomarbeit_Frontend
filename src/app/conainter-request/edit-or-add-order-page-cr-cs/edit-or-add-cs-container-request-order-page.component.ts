import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, OnInit, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticleCRDto, AddChecklistDto, AddCsinquiryDto, AddOrderDto, AddStepDto, ArticlesCRService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditCsinquiryDto, EditOrderCSDto, OrdersService, StepsService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../shared/validation.service';
import { EditService } from '../../shared/edit.service';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-or-add-cs-container-request-order-page.component.html',
  styleUrl: './edit-or-add-cs-container-request-order-page.component.scss'
})
export class EditOrAddCsContainerRequestOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;
  @Input() actionType = '';

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });

    if (this.actionType === 'new') {
      this.addArticle(1, 1, 1);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editService.navigationPath = '/container-request-page/containerRequestCS';

    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => {
        this.allChecklists.set(x)
        this.editService.checklistId.set(x.first().id)
      });

    if (this.actionType === 'edit') {
      this.orderService.ordersIdGet(this.id)
        .subscribe(x => {
          this.editService.currOrder.set(x);

          this.editService.setOrderSignals(this.editService.currOrder());

          this.tlInquiryService.tlinquiriesIdGet(this.editService.tlId())
            .subscribe(x => {
              if (x !== null && x !== undefined) {
                this.currTlInquiry.set(x);
                this.setTlInquirySignals();
              }
            });

          this.articlesCRService.articlesCRCsInquiryIdGet(this.editService.currOrder().csid)
            .subscribe(x => x.forEach(x => this.addArticle(x.articleNumber, x.pallets, x.id)));

          this.csInquiryService.csinquiriesIdGet(this.editService.currOrder().csid)
            .subscribe(x => {
              this.currCsInquiry.set(x);
              this.setCsInquirySignals();
              this.setRadioButtonsInputsValid();
            });

          this.tlInquiryService.tlinquiriesIdGet(this.editService.currOrder().tlid)
            .subscribe(x => this.isApprovedByTl.set(x.approvedByCrTl));
        });
    }
  }

  articlesCRService = inject(ArticlesCRService);
  validationService = inject(ValidationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  tlInquiryService = inject(TlinquiriesService);
  csInquiryService = inject(CsinquiriesService);
  editService = inject(EditService);
  stepsService = inject(StepsService);

  myForm!: FormGroup;
  allChecklists = signal<ChecklistDto[]>([]);
  currCsInquiry = signal<CsinquiryDto>(
    {
      id: 1,
      abnumber: 1,
      country: 'Loading',
      grossWeightInKg: 1,
      incoterm: 'Loading',
      containersizeA: 1,
      containersizeB: 1,
      containersizeHc: 1,
      freeDetention: 1,
      thctb: false,
      thcc: false,
      readyToLoad: '01.01.1999',
      approvedByCrCs: false,
      approvedByCrCsTime: "",
      isDirectLine: false,
      isFastLine: false
    });
  currTlInquiry = signal<TlinquiryDto>(
    {
      id: 1,
      sped: 'Loading',
      acceptingPort: 'Loading',
      invoiceOn: '17.12.2023',
      retrieveDate: '17.12.2023',
      retrieveLocation: 'Loading',
      scGeneral: 1,
      scMain: 1,
      scTrail: 1,
      portOfDeparture: 'Loading',
      ets: '17.12.2023',
      eta: '17.12.2023',
      boat: 'Loading',
      approvedByCrTl: false,
      approvedByCrTlTime: ""
    });

  durations = [10, 14, 21, 0];
  thcs = [0, 1, 2];
  lines = [0, 1, 2];
  selectedThc: number = 3;
  selectedFreeDetention: number = this.durations[3];
  selectedLine: number = 3;
  isApprovedByCs = signal(false);
  isApprovedByTl = signal(false);
  abnumber = signal(0);
  grossWeightInKg = signal(0);
  incoterm = signal('');
  containersizeA = signal(0);
  containersizeB = signal(0);
  containersizeHc = signal(0);
  readyToLoad = signal('');
  sped = signal('');
  country = signal('');
  acceptingPort = signal('');
  expectedRetrieveWeek = signal('');
  invoiceOn = signal('');
  retrieveDate = signal('');
  retrieveLocation = signal('');
  scGeneral = signal(0);
  scMain = signal(0);
  scTrail = signal(0);
  portOfDeparture = signal('');
  ets = signal('');
  eta = signal('');
  boat = signal('');
  areArticleNumbersValid = signal<boolean>(true);
  areRadioButtonInputsValid = signal<boolean>(false);
  isCountryValid = computed(() => this.validationService.isNameStringValid(this.country()));
  isReadyToLoadValid = computed(() => this.validationService.isDateValid(this.readyToLoad()));
  isCustomerValid = computed(() => this.validationService.isAnyInputValid(this.editService.customerName()));
  isCreatedByValid = computed(() => this.validationService.isNameStringValid(this.editService.createdByCS()));
  isAbNumberValid = computed(() => this.validationService.isNumberGreaterZeroValid(this.abnumber()));
  isGrossWeightInKgValid = computed(() => this.validationService.isNumberValid(this.grossWeightInKg()));
  isContainerSizeAValid = computed(() => this.validationService.isNumberValid(this.containersizeA()));
  isContainerSizeBValid = computed(() => this.validationService.isNumberValid(this.containersizeB()));
  isContainerSizeHcValid = computed(() => this.validationService.isNumberValid(this.containersizeHc()));
  isIncotermValid = computed(() => this.validationService.isAnyInputValid(this.incoterm()));
  isChecklistValid = computed(() => this.allChecklists().length > 0);
  isAllValid = computed(() => {
    console.log(this.allChecklists().length);
    return (
      this.isChecklistValid() &&
      this.areRadioButtonInputsValid() &&
      this.isReadyToLoadValid() &&
      this.isCountryValid() &&
      this.isIncotermValid() &&
      this.isCustomerValid() &&
      this.isCreatedByValid() &&
      this.isAbNumberValid() &&
      this.isGrossWeightInKgValid() &&
      this.isContainerSizeAValid() &&
      this.isContainerSizeBValid() &&
      this.isContainerSizeHcValid() &&
      this.areArticleNumbersValid() &&
      !this.editService.currOrder().successfullyFinished &&
      !this.editService.currOrder().canceled
    );
  });

  setRadioButtonsInputsValid(){
    this.areRadioButtonInputsValid.set(this.selectedLine !== 3 &&this.selectedThc !== 3);
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, pallets: number, id: number) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber],
      palletAmount: [pallets],
      id: [id]
    });

    this.articlesFormArray.push(articleGroup);
    this.setAreArticleNumbersValid();
  }

  cancelOrder() {
    this.orderService.ordersCancelPut(this.editService.createEditStatusDto(this.editService.currOrder().id, true))
      .subscribe(x => this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('order-canceled'))
        .subscribe(_ => this.editService.navigateToPath()));
  }

  finishOrder() {
    this.orderService.ordersSuccessfullyFinishedPut(this.editService.createEditStatusDto(this.editService.currOrder().id, true))
      .subscribe(x => this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('order-finished'))
        .subscribe(_ => this.editService.navigateToPath()));
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  removeArticle(index: number) {
    this.articlesFormArray.removeAt(index);
    this.setAreArticleNumbersValid();
  }

  setAreArticleNumbersValid() {
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (this.getFormGroup(i).get('articleNumber')!.value < 1) {
        this.areArticleNumbersValid.set(false);
        return;
      }

      if ((this.selectedLine === 0 || this.selectedLine === 1) && this.getFormGroup(i).get('palletAmount')!.value < 1) {
        this.areArticleNumbersValid.set(false);
        return;
      }
    }
    this.areArticleNumbersValid.set(true);
  }

  getEditOrderCSDto() {
    const order: EditOrderCSDto = {
      customerName: this.editService.customerName(),
      createdBy: this.editService.createdByCS(),
      id: this.id,
      additionalInformation: this.editService.additonalInformation() === '' ? null : this.editService.additonalInformation()
    };

    return order;
  }

  saveNewOrderWithoutPublish(){
    this.saveNewOrder().then(() => {
      this.editService.navigateToPath();
    }).catch(error => {
      console.error('Error saving new order:', error);
    });
  }

  saveOrder(): void {
    let order = this.getEditOrderCSDto();

    this.orderService.ordersOrderCSPut(order)
      .subscribe(x => {
        this.saveCsInquery();
        this.saveArticles();
        this.editService.navigateToPath();
      });
  }

  publish() {
    let order = this.getEditOrderCSDto();

    this.orderService.ordersOrderCSPut(order)
      .subscribe(x => {
        this.saveCsInquery();
        this.saveArticles();
        this.publishOrder();
      });
  }

  postAndPublish() {
    this.saveNewOrder().then(() => {
      this.publishOrder();
    }).catch(error => {
      console.error('Error saving new order:', error);
    });
  }

  publishOrder() {
    this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('sent-to-tl'))
      .subscribe(x => x);

    if (this.isApprovedByTl()) {
      this.tlInquiryService.tlinquiriesApproveCrTlPut(this.editService.createEditStatusDto(this.editService.currOrder().tlid, false))
        .subscribe(_ => _);
    }

    this.csInquiryService.csinquiriesApproveCrCsPut(this.editService.createEditStatusDto(this.editService.currOrder().csid, true))
      .subscribe(x => this.editService.navigateToPath());
  }

  saveNewOrder(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log('saving new order');
      let isDirectLine = false;
      let isFastLine = false;
      if (this.selectedLine === 0) {
        isFastLine = true;
      } else if (this.selectedLine === 1) {
        isDirectLine = true;
      }

      let isThctb = false;
      let isThcc = false;
      if (this.selectedThc === 0) {
        isThctb = true;
      } else if (this.selectedThc === 1) {
        isThcc = true;
      }

      let csInquiry: AddCsinquiryDto = {
        country: this.country(),
        abnumber: this.abnumber(),
        bruttoWeightInKg: this.grossWeightInKg(),
        incoterm: this.incoterm(),
        containersizeA: this.containersizeA(),
        containersizeB: this.containersizeB(),
        containersizeHc: this.containersizeHc(),
        freeDetention: this.selectedFreeDetention,
        thctb: isThctb,
        thcc: isThcc,
        readyToLoad: this.readyToLoad(),
        isDirectLine: isDirectLine,
        isFastLine: isFastLine
      };
      console.log(csInquiry);

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
                checklistname: this.allChecklists().single(x => x.id == this.editService.checklistId()).checklistname
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
                    .subscribe(x => {
                      console.log('Order saved successfully');
                      this.editService.currOrder.set(x)
                      resolve();
                    }, error => {
                      console.error('Error saving order:', error);
                      reject(error);
                    });
                });
            });
        });
    });
  }

  saveArticles() {
    this.articlesCRService.articlesCRCsIdDelete(this.currCsInquiry().id)
      .subscribe(x => {
        for (let i = 0; i < this.articlesFormArray.length; i++) {

          let article: AddArticleCRDto = {
            pallets: this.getFormGroup(i).get('palletAmount')!.value,
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            csInquiryId: this.currCsInquiry().id
          };

          this.articlesCRService.articlesCRPost(article).subscribe(x =>
            console.log('article posted: ' + x.id)
          );
        }
      });
  }

  saveCsInquery() {
    let isDirectLine = false;
    let isFastLine = false;
    if (this.selectedLine === 0) {
      isFastLine = true;
    } else if (this.selectedLine === 1) {
      isDirectLine = true;
    }

    let isThctb = false;
    let isThcc = false;
    if (this.selectedThc === 0) {
      isThctb = true;
    } else if (this.selectedThc === 1) {
      isThcc = true;
    }

    let editedCsInquery: EditCsinquiryDto = {
      id: this.currCsInquiry().id,
      country: this.country(),
      abnumber: this.abnumber(),
      grossWeightInKg: this.grossWeightInKg(),
      incoterm: this.incoterm(),
      containersizeA: this.containersizeA(),
      containersizeB: this.containersizeB(),
      containersizeHc: this.containersizeHc(),
      freeDetention: this.selectedFreeDetention,
      thctb: isThctb,
      thcc: isThcc,
      readyToLoad: this.readyToLoad(),
      isDirectLine: isDirectLine,
      isFastLine: isFastLine
    }
    console.log(editedCsInquery);

    this.csInquiryService.csinquiriesPut(editedCsInquery)
      .subscribe(x => console.log('RETURN VALUE OF CSINQUERY SAVE: ' + x.id + x.abnumber + x.freeDetention + x.readyToLoad));
  }

  setCsInquirySignals() {
    if (this.currCsInquiry().thctb === true) {
      this.selectedThc = 0;
    } else if (this.currCsInquiry().thcc === true) {
      this.selectedThc = 1;
    }else {
      this.selectedThc = 2;
    }

    if (this.currCsInquiry().isFastLine === true) {
      this.selectedLine = 0;
    } else if (this.currCsInquiry().isDirectLine === true) {
      this.selectedLine = 1;
    } else{
      this.selectedLine = 2;
    }

    this.abnumber.set(this.currCsInquiry().abnumber);
    this.grossWeightInKg.set(this.currCsInquiry().grossWeightInKg);
    this.incoterm.set(this.currCsInquiry().incoterm);
    this.containersizeA.set(this.currCsInquiry().containersizeA);
    this.containersizeB.set(this.currCsInquiry().containersizeB);
    this.country.set(this.currCsInquiry().country);
    this.containersizeHc.set(this.currCsInquiry().containersizeHc);
    this.selectedFreeDetention = this.currCsInquiry().freeDetention;
    this.readyToLoad.set(this.currCsInquiry().readyToLoad);
    this.isApprovedByCs.set(this.currCsInquiry().approvedByCrCs);
  }

  setTlInquirySignals(): void {
    this.sped.set(this.currTlInquiry().sped);
    this.acceptingPort.set(this.currTlInquiry().acceptingPort);
    this.invoiceOn.set(this.currTlInquiry().invoiceOn);
    this.retrieveDate.set(this.currTlInquiry().retrieveDate);
    this.retrieveLocation.set(this.currTlInquiry().retrieveLocation);
    this.scGeneral.set(this.currTlInquiry().scGeneral);
    this.scMain.set(this.currTlInquiry().scMain);
    this.scTrail.set(this.currTlInquiry().scTrail);
    this.portOfDeparture.set(this.currTlInquiry().portOfDeparture);
    this.ets.set(this.currTlInquiry().ets);
    this.eta.set(this.currTlInquiry().eta);
    this.boat.set(this.currTlInquiry().boat);
  }
}