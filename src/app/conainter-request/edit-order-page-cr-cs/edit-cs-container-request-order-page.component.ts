import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, OnInit, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticleCRDto, ArticlesCRService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditCsinquiryDto, EditOrderCSDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../shared/validation.service';
import { EditService } from '../../edit.service';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-cs-container-request-order-page.component.html',
  styleUrl: './edit-cs-container-request-order-page.component.scss'
})
export class EditCsContainerRequestOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editService.navigationPath = '/container-request-page/containerRequestCS';

    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => this.allChecklists.set(x));

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        this.editService.currOrder.set(x);
        this.editService.setOrderSignals(this.editService.currOrder());

        this.tlinquiriesService.tlinquiriesIdGet(this.editService.tlId())
          .subscribe(x => {
            if (x !== null && x !== undefined) {
              this.currTlInquiry.set(x);
              this.setTlInquirySignals();
            }
          });

        this.articlesCRService.articlesCRCsInquiryIdGet(this.editService.currOrder().csid)
          .subscribe(x => x.forEach(x => this.addArticle(x.articleNumber, x.pallets, x.id)));

        this.csinquiriesService.csinquiriesIdGet(this.editService.currOrder().csid)
          .subscribe(x => {
            this.currCsInquiry.set(x);
            this.setCsInquirySignals();
          });

        this.tlinquiryService.tlinquiriesIdGet(this.editService.currOrder().tlid)
          .subscribe(x => this.isApprovedByTl.set(x.approvedByCrTl));
      });
  }

  articlesCRService = inject(ArticlesCRService);
  validationService = inject(ValidationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  tlinquiriesService = inject(TlinquiriesService);
  csinquiriesService = inject(CsinquiriesService);
  editService = inject(EditService);
  tlinquiryService = inject(TlinquiriesService);

  myForm!: FormGroup;
  allChecklists = signal<ChecklistDto[]>([]);
  currCsInquiry = signal<CsinquiryDto>(
    {
      id: 1,
      container: 'Loading',
      abnumber: 1,
      grossWeightInKg: 1,
      incoterm: 'Loading',
      containersizeA: 1,
      containersizeB: 1,
      containersizeHc: 1,
      freeDetention: 1,
      thctb: false,
      readyToLoad: '01.01.1999',
      loadingPlattform: 'Loading',
      approvedByCrCs: false,
      approvedByCrCsTime: "",
      isDirectLine: false,
      isFastLine: false
    });
  currTlInquiry = signal<TlinquiryDto>(
    {
      id: 1,
      sped: 'Loading',
      country: 'Loading',
      acceptingPort: 'Loading',
      expectedRetrieveWeek: '17.12.2023',
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
  thcs = [true, false];
  lines = [0,1,2];
  selectedThc: boolean = this.thcs[0];
  selectedFreeDetention: number = this.durations[0];
  selectedLine: number = this.lines[0];
  isApprovedByCs = signal(false);
  isApprovedByTl = signal(false);
  fastLine = signal(false);
  directLine = signal(false);
  container = signal('');
  abnumber = signal(0);
  grossWeightInKg = signal(0);
  incoterm = signal('');
  containersizeA = signal(0);
  containersizeB = signal(0);
  containersizeHc = signal(0);
  readyToLoad = signal('');
  loadingPlattform = signal('');
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
  isReadyToLoadValid = computed(() => this.validationService.isDateValid(this.readyToLoad()));
  isLoadingPlattfromValid = computed(() => this.validationService.isAnyInputValid(this.loadingPlattform()));
  isCustomerValid = computed(() => this.validationService.isAnyInputValid(this.editService.customerName()));
  isCreatedByValid = computed(() => this.validationService.isNameStringValid(this.editService.createdByCS()));
  isAbNumberValid = computed(() => this.validationService.isNumberValid(this.abnumber()));
  isGrossWeightInKgValid = computed(() => this.validationService.isNumberValid(this.grossWeightInKg()));
  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.editService.status()));
  isContainerSizeAValid = computed(() => this.validationService.isNumberValid(this.containersizeA()));
  isContainerSizeBValid = computed(() => this.validationService.isNumberValid(this.containersizeB()));
  isContainerSizeHcValid = computed(() => this.validationService.isNumberValid(this.containersizeHc()));
  isIncotermValid = computed(() => this.validationService.isAnyInputValid(this.incoterm()));
  isAllValid = computed(() => {
    return (
      this.isReadyToLoadValid() &&
      this.isCustomerValid() &&
      this.isLoadingPlattfromValid() &&
      this.isCreatedByValid() &&
      this.isAbNumberValid() &&
      this.isGrossWeightInKgValid() &&
      this.isStatusValid() &&
      this.isContainerSizeAValid() &&
      this.isContainerSizeBValid() &&
      this.isContainerSizeHcValid() &&
      this.areArticleNumbersValid() &&
      !this.editService.currOrder().successfullyFinished &&
      !this.editService.currOrder().canceled
    );
  });

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, id: number) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      palletAmount: [palletAmount, Validators.required],
      id: [id]
    });

    this.articlesFormArray.push(articleGroup);
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

      if ((this.selectedLine === 2 || this.selectedLine === 1) && this.getFormGroup(i).get('palletAmount')!.value < 1) {
        this.areArticleNumbersValid.set(false);
        return;
      }
    }
    this.areArticleNumbersValid.set(true);
  }

  prepareSaveOrder() {
    const order: EditOrderCSDto = {
      customerName: this.editService.customerName(),
      createdBy: this.editService.createdByCS(),
      id: this.id,
      additionalInformation: this.editService.additonalInformation() === '' ? null : this.editService.additonalInformation()
    };

    return order;
  }

  saveOrder(): void {
    let order = this.prepareSaveOrder();

    this.orderService.ordersOrderCSPut(order)
      .subscribe(x => {
        this.saveCsInquery();
        this.saveArticles();
        this.editService.navigateToPath();
      });
  }

  publish() {
    let order = this.prepareSaveOrder();

    this.orderService.ordersOrderCSPut(order)
      .subscribe(x => {
        this.saveCsInquery();
        this.saveArticles();

        this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('sent-to-tl'))
          .subscribe(x => x);

        if (this.isApprovedByTl()) {
          this.tlinquiriesService.tlinquiriesApproveCrTlPut(this.editService.createEditStatusDto(this.editService.currOrder().tlid, false))
            .subscribe(_ => _);
        }

        this.csinquiriesService.csinquiriesApproveCrCsPut(this.editService.createEditStatusDto(this.editService.currOrder().csid, true))
          .subscribe(x => this.editService.navigateToPath());
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
    if(this.selectedLine === 1){
      isFastLine = true;
    }else if(this.selectedLine === 2){
      isDirectLine = true;
    }

    let editedCsInquery: EditCsinquiryDto = {
      id: this.currCsInquiry().id,
      container: this.container(),
      abnumber: this.abnumber(),
      grossWeightInKg: this.grossWeightInKg(),
      incoterm: this.incoterm(),
      containersizeA: this.containersizeA(),
      containersizeB: this.containersizeB(),
      containersizeHc: this.containersizeHc(),
      freeDetention: this.selectedFreeDetention,
      thctb: this.selectedThc,
      readyToLoad: this.readyToLoad(),
      loadingPlattform: this.loadingPlattform(),
      isDirectLine: isDirectLine,
      isFastLine: isFastLine
    }

    this.csinquiriesService.csinquiriesPut(editedCsInquery)
      .subscribe(x => console.log('RETURN VALUE OF CSINQUERY SAVE: ' + x.id + x.abnumber + x.freeDetention + x.readyToLoad));
  }

  setCsInquirySignals() {
    this.container.set(this.currCsInquiry().container);
    this.abnumber.set(this.currCsInquiry().abnumber);
    this.grossWeightInKg.set(this.currCsInquiry().grossWeightInKg);
    this.incoterm.set(this.currCsInquiry().incoterm);
    this.containersizeA.set(this.currCsInquiry().containersizeA);
    this.containersizeB.set(this.currCsInquiry().containersizeB);
    this.containersizeHc.set(this.currCsInquiry().containersizeHc);
    this.selectedThc = this.currCsInquiry().thctb;
    this.selectedFreeDetention = this.currCsInquiry().freeDetention;
    this.readyToLoad.set(this.currCsInquiry().readyToLoad);
    this.loadingPlattform.set(this.currCsInquiry().loadingPlattform);
    this.fastLine.set(this.currCsInquiry().isFastLine);
    this.directLine.set(this.currCsInquiry().isDirectLine);
    this.isApprovedByCs.set(this.currCsInquiry().approvedByCrCs);
  }

  setTlInquirySignals(): void {
    this.sped.set(this.currTlInquiry().sped);
    this.country.set(this.currTlInquiry().country);
    this.acceptingPort.set(this.currTlInquiry().acceptingPort);
    this.expectedRetrieveWeek.set(this.currTlInquiry().expectedRetrieveWeek);
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