import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditApproveOrderDto, EditOrderDto, EditTlInqueryDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ValidationService } from '../../shared/validation.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditService } from '../../edit.service';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-tl-container-request-order-page.component.html',
  styleUrl: './edit-tl-container-request-order-page.component.scss'
})
export class EditTlContainerRequestOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  articlesService = inject(ArticlesService);
  fb = inject(FormBuilder);
  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  tlinquiriesService = inject(TlinquiriesService);
  csinquiriesService = inject(CsinquiriesService);
  validationService = inject(ValidationService);
  editService = inject(EditService);

  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      approvedByCrCs: false,
      approvedByCrTl: false,
      approvedByPpCs: false,
      approvedByPpPp: false,
      amount: 0,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      readyToLoad: 'Test',
      abNumber: 1,
      country: 'Test',
      sped: 'Test',
      additionalInformation: '',
      approvedByCsTime: '',
      approvedByTlTime: '',
      approvedByPpCsTime: '',
      approvedByPpPpTime: ''
    });
  allChecklists = signal<ChecklistDto[]>([]);
  currCsInquiry = signal<CsinquiryDto>({
    id: 0,
    container: '',
    abnumber: 0,
    grossWeightInKg: 0,
    incoterm: '',
    containersizeA: 0,
    containersizeB: 0,
    containersizeHc: 0,
    freeDetention: false,
    thctb: false,
    readyToLoad: '',
    loadingPlattform: ''
  });
  currTlInquiry = signal<TlinquiryDto>(
    {
      id: 1,
      inquiryNumber: 1,
      sped: 'Loading',
      country: 'Loading',
      acceptingPort: 'Loading',
      expectedRetrieveWeek: '17.12.2023',
      weightInKg: 1,
      invoiceOn: '17.12.2023',
      retrieveDate: '17.12.2023',
      isContainer40: false,
      isContainerHc: false,
      retrieveLocation: 'Loading',
      debtCapitalGeneralForerunEur: 1,
      debtCapitalMainDol: 1,
      debtCapitalTrailingDol: 1,
      portOfDeparture: 'Loading',
      ets: '17.12.2023',
      eta: '17.12.2023',
      boat: 'Loading'
    });

  //OrderData
  isApprovedByCs = signal(false);
  isApprovedByTl = signal(false);
  currChecklistname = signal('');

  //CsData
  container = signal('');
  abnumber = signal(0);
  grossWeightInKg = signal(0);
  incoterm = signal('');
  containersizeA = signal(0);
  containersizeB = signal(0);
  containersizeHc = signal(0);
  freeDetention = signal(false);
  thctb = signal(false);
  readyToLoad = signal('');
  loadingPlattform = signal('');

  //TlData
  inquiryNumber = signal(0);
  sped = signal('');
  country = signal('');
  acceptingPort = signal('');
  expectedRetrieveWeek = signal('');
  weightInKg = signal(0);
  invoiceOn = signal('');
  retrieveDate = signal('');
  isContainer40 = signal(false);
  isContainerHc = signal(false);
  retrieveLocation = signal('');
  debtCapitalGeneralForerunEur = signal(0);
  debtCapitalMainDol = signal(0);
  debtCapitalTrailingDol = signal(0);
  portOfDeparture = signal('');
  ets = signal('');
  eta = signal('');
  boat = signal('');

  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.editService.status()));
  isInquiryNumberValid = computed(() => this.validationService.isNumberValid(this.inquiryNumber()));
  isSpedValid = computed(() => this.validationService.isAnyInputValid(this.sped()));
  isCountryValid = computed(() => this.validationService.isNameStringValid(this.country()));
  isAcceptingPortValid = computed(() => this.validationService.isAnyInputValid(this.acceptingPort()));
  isExpectedRetrieveWeekValid = computed(() => this.validationService.isDateValid(this.expectedRetrieveWeek()));
  isWeigthInKgValid = computed(() => this.validationService.isNumberValid(this.weightInKg()));
  isInvoiceOnValid = computed(() => this.validationService.isDateValid(this.invoiceOn()));
  isRetrieveDateValid = computed(() => this.validationService.isDateValid(this.retrieveDate()));
  isRetrieveLocationValid = computed(() => this.validationService.isAnyInputValid(this.retrieveLocation()));
  isDebtCapitalGeneralForerunEurValid = computed(() => this.validationService.isNumberValid(this.debtCapitalGeneralForerunEur()));
  isDebtCapitalMainDolValid = computed(() => this.validationService.isNumberValid(this.debtCapitalMainDol()));
  isDebtCapitalTrailingDolValid = computed(() => this.validationService.isNumberValid(this.debtCapitalTrailingDol()));
  isPortOfDepartureValid = computed(() => this.validationService.isAnyInputValid(this.portOfDeparture()));
  isEtsValid = computed(() => this.validationService.isDateValid(this.ets()));
  isEtaValid = computed(() => this.validationService.isDateValid(this.eta()));
  isBoatValid = computed(() => this.validationService.isAnyInputValid(this.boat()));

  myForm!: FormGroup;

  ngOnInit(): void {
    console.log(),

    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editService.navigationPath = '/container-request-page/containerRequestTL';

    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => {
        this.allChecklists.set(x);
      });

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        if (x !== null && x !== undefined) {
          this.currOrder.set(x);
          console.log(this.currOrder());
          this.setOrderSignals();
          this.tlinquiriesService.tlinquiriesIdGet(this.editService.tlId())
            .subscribe(x => {
              if (x !== null && x !== undefined) {
                this.currTlInquiry.set(x);
                this.setTlInquirySignals();
              }
            });

          this.articlesService.articlesCsInquiryIdGet(this.currOrder().csid)
            .subscribe(x => x.forEach(x => {
              this.addArticle(x.articleNumber, x.pallets, x.isDirectLine, x.isFastLine, x.id);
              console.log('adding Article');
            }));

          this.csinquiriesService.csinquiriesIdGet(this.editService.csId())
            .subscribe(x => {
              if (x !== null && x !== undefined) {
                this.currCsInquiry.set(x);
                this.setCsInquirySignals();
              }
            });

          this.checklistService.checklistsIdGet(this.currOrder().checklistId)
            .subscribe(x => {
              if (x.checklistname !== null && x.checklistname !== undefined) {
                this.currChecklistname.set(x.checklistname);
              }
            });
        }
      });
  }

  isAllValid = computed(() => {
    return (
      this.isStatusValid() &&
      this.isInquiryNumberValid() &&
      this.isSpedValid() &&
      this.isCountryValid() &&
      this.isAcceptingPortValid() &&
      this.isExpectedRetrieveWeekValid() &&
      this.isWeigthInKgValid() &&
      this.isInvoiceOnValid() &&
      this.isRetrieveDateValid() &&
      this.isRetrieveLocationValid() &&
      this.isDebtCapitalGeneralForerunEurValid() &&
      this.isDebtCapitalMainDolValid() &&
      this.isDebtCapitalTrailingDolValid() &&
      this.isPortOfDepartureValid() &&
      this.isEtsValid() &&
      this.isEtaValid() &&
      this.isBoatValid() &&
      !this.isApprovedByTl()
    );
  });


  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }


  addArticle(articleNumber: number, palletAmount: number, directLine: boolean, fastline: boolean, id: number) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      palletAmount: [palletAmount, Validators.required],
      directline: [directLine],
      fastline: [fastline],
      id: [id]
    });

    this.articlesFormArray.push(articleGroup);
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  saveArticles() {
    const articles = this.myForm.value.articles;
    console.log('Entered Articles:', articles);
  }

  prepareSaveOrder() {
    const order: EditOrderDto = {
      customerName: this.editService.customerName(),
      status: this.editService.status(),
      createdBy: this.editService.createdBy(),
      amount: this.editService.amount(),
      checklistId: this.editService.checklistId(),
      id: this.id,
      approvedByTl: this.isApprovedByTl(),
      approvedByCs: this.isApprovedByCs(),
      additionalInformation: this.editService.additonalInformation() === '' ? undefined : this.editService.additonalInformation()
  };

    return order;
  }

  saveOrder(): void {
    let order = this.prepareSaveOrder();

    this.orderService.ordersPut(order)
      .subscribe(x => this.saveTlInquery());
  }

  saveTlInquery() {
    let editedTlInquiry: EditTlInqueryDto =
    {
      id: this.currTlInquiry().id,
      inquiryNumber: this.inquiryNumber(),
      sped: this.sped(),
      country: this.country(),
      acceptingPort: this.acceptingPort(),
      expectedRetrieveWeek: this.expectedRetrieveWeek(),
      weightInKg: this.weightInKg(),
      invoiceOn: this.invoiceOn(),
      retrieveDate: this.retrieveDate(),
      isContainer40: this.isContainer40(),
      isContainerHc: this.isContainerHc(),
      retrieveLocation: this.retrieveLocation(),
      debtCapitalGeneralForerunEur: this.debtCapitalGeneralForerunEur(),
      debtCapitalMainDol: this.debtCapitalMainDol(),
      debtCapitalTrailingDol: this.debtCapitalTrailingDol(),
      portOfDeparture: this.portOfDeparture(),
      ets: this.ets(),
      eta: this.eta(),
      boat: this.boat()
    }

    this.tlinquiriesService.tlinquiriesPut(editedTlInquiry)
      .subscribe(x => this.editService.navigateToPath());
  }

  publish() {
    let order = this.prepareSaveOrder();

    this.orderService.ordersPut(order)
      .subscribe(x => {
        this.saveTlInquery();
        this.orderService.ordersApprovedByCrTlPut(this.editService.createEditOrder(this.currOrder().id))
          .subscribe(x => this.editService.navigateToPath());
      });
  }

  setOrderSignals(): void {
    this.isApprovedByCs.set(this.currOrder().approvedByCrCs);
    this.isApprovedByTl.set(this.currOrder().approvedByCrTl);
    this.editService.setOrderSignals(this.currOrder());
  }

  setCsInquirySignals() {
    this.container.set(this.currCsInquiry().container);
    this.abnumber.set(this.currCsInquiry().abnumber);
    this.grossWeightInKg.set(this.currCsInquiry().grossWeightInKg);
    this.incoterm.set(this.currCsInquiry().incoterm);
    this.containersizeA.set(this.currCsInquiry().containersizeA);
    this.containersizeB.set(this.currCsInquiry().containersizeB);
    this.containersizeHc.set(this.currCsInquiry().containersizeHc);
    this.freeDetention.set(this.currCsInquiry().freeDetention);
    this.thctb.set(this.currCsInquiry().thctb);
    this.readyToLoad.set(this.currCsInquiry().readyToLoad);
    this.loadingPlattform.set(this.currCsInquiry().loadingPlattform);
  }

  setTlInquirySignals(): void {
    this.inquiryNumber.set(this.currTlInquiry().inquiryNumber);
    this.sped.set(this.currTlInquiry().sped);
    this.country.set(this.currTlInquiry().country);
    this.acceptingPort.set(this.currTlInquiry().acceptingPort);
    this.expectedRetrieveWeek.set(this.currTlInquiry().expectedRetrieveWeek);
    this.weightInKg.set(this.currTlInquiry().weightInKg);
    this.invoiceOn.set(this.currTlInquiry().invoiceOn);
    this.retrieveDate.set(this.currTlInquiry().retrieveDate);
    this.isContainer40.set(this.currTlInquiry().isContainer40);
    this.isContainerHc.set(this.currTlInquiry().isContainerHc);
    this.retrieveLocation.set(this.currTlInquiry().retrieveLocation);
    this.debtCapitalGeneralForerunEur.set(this.currTlInquiry().debtCapitalGeneralForerunEur);
    this.debtCapitalMainDol.set(this.currTlInquiry().debtCapitalMainDol);
    this.debtCapitalTrailingDol.set(this.currTlInquiry().debtCapitalTrailingDol);
    this.portOfDeparture.set(this.currTlInquiry().portOfDeparture);
    this.ets.set(this.currTlInquiry().ets);
    this.eta.set(this.currTlInquiry().eta);
    this.boat.set(this.currTlInquiry().boat);
  }
}
