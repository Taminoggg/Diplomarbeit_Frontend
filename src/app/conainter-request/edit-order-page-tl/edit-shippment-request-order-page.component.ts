import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditOrderDto, EditTlInqueryDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
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
  templateUrl: './edit-shippment-request-order-page.component.html',
  styleUrl: './edit-shippment-request-order-page.component.scss'
})
export class EditShippmentOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, directLine: boolean, fastLine: boolean, id:number) {
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

  myForm!: FormGroup;
  fb = inject(FormBuilder);

  ngOnChanges(changes: SimpleChanges): void {
    console.log('id: ' + this.id);
    this.checklistService.checklistsGet()
      .subscribe(x => {
        this.allChecklists.set(x);

      });
      
    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        this.currOrder.set(x);
        console.log(this.currOrder());
        this.setOrderSignals();
        this.tlinquiriesService.tlinquiriesIdGet(this.tlId())
          .subscribe(x => {
            this.currTlInquiry.set(x);
            this.setTlInquirySignals();
          });
      });
  }

  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  tlinquiriesService = inject(TlinquiriesService);
  validationService = inject(ValidationService);

  userText = signal('');
  isCustomerValid = computed(() => this.validationService.isCustomerValid(this.customerName()));
  isCreatedByValid = computed(() => this.validationService.isCreatedByValid(this.createdBy()));
  isStatusValid = computed(() => this.validationService.isStatusValid(this.status()));
  isAmountValid = computed(() => this.validationService.isAmountValid(this.amount()));


  containerRequestPage() {
    this.router.navigateByUrl('/container-request-page/tl');
  }

  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      approvedByCs: false,
      approvedByTs: false,
      amount: 0,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      readyToLoad: 'Test',
      abNumber: 1,
      country: 'Test',
      sped: 'Test',
    });
  allChecklists = signal<ChecklistDto[]>([]);
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
  tlId = signal(0);
  customerName = signal('');
  createdBy = signal('');
  status = signal('');
  amount = signal(0);
  checklistId = signal(0);
  isApprovedByCs = signal(false);
  isApprovedByTs = signal(false);

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
    let order: EditOrderDto = {
      customerName: this.customerName(),
      status: this.status(),
      createdBy: this.createdBy(),
      amount: this.amount(),
      checklistId: this.checklistId(),
      id: this.id,
      approvedByTs: this.isApprovedByTs(),
      approvedByCs: this.isApprovedByCs()
    };

    console.log(order);

    this.orderService.ordersPut(order)
      .subscribe(x => {
        console.log(x);
      });

    this.saveTlInquery();

    this.containerRequestPage();
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
      .subscribe(x => console.log('Editing tlinquiry: ' + x.country + ' ' + x.retrieveLocation));
  }

  setOrderSignals() {
    this.tlId.set(this.currOrder().tlid);
    this.customerName.set(this.currOrder().customerName);
    this.createdBy.set(this.currOrder().createdBy);
    this.status.set(this.currOrder().status);
    this.amount.set(this.currOrder().amount);
    this.checklistId.set(this.currOrder().checklistId);
    this.isApprovedByCs.set(this.currOrder().approvedByCs);
    this.isApprovedByTs.set(this.currOrder().approvedByTs);
  }

  setTlInquirySignals() {
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
