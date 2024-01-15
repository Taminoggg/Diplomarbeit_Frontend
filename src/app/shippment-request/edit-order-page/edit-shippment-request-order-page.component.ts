import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditOrderDto, EditTlInqueryDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule],
  templateUrl: './edit-shippment-request-order-page.component.html',
  styleUrl: './edit-shippment-request-order-page.component.scss'
})
export class EditShippmentOrderPageComponent implements OnChanges {
  @Input({ transform: numberAttribute }) id = 0;
  dataService: any;

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

  shippmentRequestPage() {
    this.router.navigateByUrl('/shippment-request-page');
  }

  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 1,
      customerName: 'Test',
      createdBy: 'Test',
      approved: false,
      amount: 0,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1
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
  tlId = signal(this.currOrder().tlid);
  customerName = signal(this.currOrder().customerName);
  createdBy = signal(this.currOrder().createdBy);
  status = signal(this.currOrder().status);
  amount = signal(this.currOrder().amount);
  checklistId = signal(this.currOrder().checklistId);
  isApproved = signal(this.currOrder().approved);

  //CsData
  inquiryNumber = signal(this.currTlInquiry().inquiryNumber);
  sped = signal(this.currTlInquiry().sped);
  country = signal(this.currTlInquiry().country);
  acceptingPort = signal(this.currTlInquiry().acceptingPort);
  expectedRetrieveWeek = signal(this.currTlInquiry().expectedRetrieveWeek);
  weightInKg = signal(this.currTlInquiry().weightInKg);
  invoiceOn = signal(this.currTlInquiry().invoiceOn);
  retrieveDate = signal(this.currTlInquiry().retrieveDate);
  isContainer40 = signal(this.currTlInquiry().isContainer40);
  isContainerHc = signal(this.currTlInquiry().isContainerHc);
  retrieveLocation = signal(this.currTlInquiry().retrieveLocation);
  debtCapitalGeneralForerunEur = signal(this.currTlInquiry().debtCapitalGeneralForerunEur);
  debtCapitalMainDol = signal(this.currTlInquiry().debtCapitalMainDol);
  debtCapitalTrailingDol = signal(this.currTlInquiry().debtCapitalTrailingDol);
  portOfDeparture = signal(this.currTlInquiry().portOfDeparture);
  ets = signal(this.currTlInquiry().ets);
  eta = signal(this.currTlInquiry().eta);
  boat = signal(this.currTlInquiry().boat);

  saveOrder(): void {
    let order: EditOrderDto = {
      customerName: this.customerName(),
      status: this.status(),
      createdBy: this.createdBy(),
      amount: this.amount(),
      checklistId: this.checklistId(),
      id: this.id,
      approved: this.isApproved()
    };

    console.log(order);

    this.orderService.ordersPut(order)
      .subscribe(x => {
        console.log(x);
      });

    this.saveTlInquery();

    this.router.navigateByUrl('/shippment-request-page');
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
    this.tlId = signal(this.currOrder().tlid);
    this.customerName = signal(this.currOrder().customerName);
    this.createdBy = signal(this.currOrder().createdBy);
    this.status = signal(this.currOrder().status);
    this.amount = signal(this.currOrder().amount);
    this.checklistId = signal(this.currOrder().checklistId);
    this.isApproved = signal(this.currOrder().approved);
  }

  setTlInquirySignals() {
    this.inquiryNumber = signal(this.currTlInquiry().inquiryNumber);
    this.sped = signal(this.currTlInquiry().sped);
    this.country = signal(this.currTlInquiry().country);
    this.acceptingPort = signal(this.currTlInquiry().acceptingPort);
    this.expectedRetrieveWeek = signal(this.currTlInquiry().expectedRetrieveWeek);
    this.weightInKg = signal(this.currTlInquiry().weightInKg);
    this.invoiceOn = signal(this.currTlInquiry().invoiceOn);
    this.retrieveDate = signal(this.currTlInquiry().retrieveDate);
    this.isContainer40 = signal(this.currTlInquiry().isContainer40);
    this.isContainerHc = signal(this.currTlInquiry().isContainerHc);
    this.retrieveLocation = signal(this.currTlInquiry().retrieveLocation);
    this.debtCapitalGeneralForerunEur = signal(this.currTlInquiry().debtCapitalGeneralForerunEur);
    this.debtCapitalMainDol = signal(this.currTlInquiry().debtCapitalMainDol);
    this.debtCapitalTrailingDol = signal(this.currTlInquiry().debtCapitalTrailingDol);
    this.portOfDeparture = signal(this.currTlInquiry().portOfDeparture);
    this.ets = signal(this.currTlInquiry().ets);
    this.eta = signal(this.currTlInquiry().eta);
    this.boat = signal(this.currTlInquiry().boat);
  }
}
