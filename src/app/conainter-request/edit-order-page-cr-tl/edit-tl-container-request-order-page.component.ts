import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditApproveOrderDto, EditOrderDto, EditTlInqueryDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ValidationService } from '../../validation.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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

  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      approvedByCs: false,
      approvedByTl: false,
      amount: 0,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      readyToLoad: 'Test',
      abNumber: 1,
      country: 'Test',
      sped: 'Test',
      additionalInformation: ''
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
  csId = signal(0);
  tlId = signal(0);
  customerName = signal('');
  createdBy = signal('');
  status = signal('');
  amount = signal(0);
  checklistId = signal(0);
  isApprovedByCs = signal(false);
  isApprovedByTl = signal(false);
  currChecklistname = signal('');
  additonalInformation = signal('');

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

  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.status()));
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
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checklistService.checklistsGet()
      .subscribe(x => {
        this.allChecklists.set(x);
      });

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        if (x !== null && x !== undefined) {
          this.currOrder.set(x);
          console.log(this.currOrder());
          this.setOrderSignals();
          this.tlinquiriesService.tlinquiriesIdGet(this.tlId())
            .subscribe(x => {
              if (x !== null && x !== undefined) {
                this.currTlInquiry.set(x);
                this.setTlInquirySignals();
              }
            });

          this.articlesService.articlesCsInquiryIdGet(this.currOrder().csid)
            .subscribe(x => x.forEach(x => this.addArticle(x.articleNumber, x.pallets, x.isDirectLine, x.isFastLine, x.id)));

          this.csinquiriesService.csinquiriesIdGet(this.csId())
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
      this.isBoatValid()
    );
  });
  

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, directLine: boolean, fastLine: boolean, id: number) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      palletAmount: [palletAmount, Validators.required],
      directline: [directLine],
      fastLine: [fastLine],
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

  containerRequestPage() {
    this.router.navigateByUrl('/container-request-page/containerRequestTL');
  }

  generatePDF() {
    const data = document.getElementById('contentToConvert');
    if (data) {
      html2canvas(data).then((canvas) => {
        const imgWidth = 208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jspdf('p', 'mm', 'a4');

        pdf.addImage(contentDataURL, 'PNG', 1, 0, imgWidth, imgHeight);
        pdf.save('myPDF.pdf');
      });
    } else {
      console.error("Element with ID 'contentToConvert' not found.");
    }
  }

  saveOrder(): void {
    let order: EditOrderDto;
    if (this.additonalInformation() === '') {
      order = {
        customerName: this.customerName(),
        status: this.status(),
        createdBy: this.createdBy(),
        amount: this.amount(),
        checklistId: this.checklistId(),
        id: this.id,
        approvedByTl: this.isApprovedByTl(),
        approvedByCs: this.isApprovedByCs()
      };
    } else {
      order = {
        customerName: this.customerName(),
        status: this.status(),
        createdBy: this.createdBy(),
        amount: this.amount(),
        checklistId: this.checklistId(),
        id: this.id,
        approvedByTl: this.isApprovedByTl(),
        approvedByCs: this.isApprovedByCs(),
        additionalInformation: this.additonalInformation()
      };
    }

    console.log(order);

    this.orderService.ordersPut(order)
      .subscribe(x => {
        this.saveTlInquery();
        this.containerRequestPage();
      });
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
      .subscribe(x => this.containerRequestPage());
  }

  publish() {
    let editOrder: EditApproveOrderDto = {
      id: this.currOrder().id,
      approve: true
    };

    this.orderService.ordersApprovedByTlPut(editOrder)
      .subscribe(x => console.log('approved'));

    this.saveOrder();
  }

  setOrderSignals(): void {
    this.csId.set(this.currOrder().csid);
    this.tlId.set(this.currOrder().tlid);
    this.customerName.set(this.currOrder().customerName);
    this.createdBy.set(this.currOrder().createdBy);
    this.status.set(this.currOrder().status);
    this.amount.set(this.currOrder().amount);
    this.checklistId.set(this.currOrder().checklistId);
    this.isApprovedByCs.set(this.currOrder().approvedByCs);
    this.isApprovedByTl.set(this.currOrder().approvedByTl);
    let additonalInformation = this.currOrder().additionalInformation
    if (additonalInformation != null && additonalInformation != undefined) {
      this.additonalInformation.set(additonalInformation);
    }
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
