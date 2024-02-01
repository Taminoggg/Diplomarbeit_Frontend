import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCsinquiryDto, AddOrderDto, AddTlinquiryDto, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-new-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule],
  templateUrl: './new-shippment-request-order-page.component.html',
  styleUrl: './new-shippment-request-order-page.component.scss'
})
export class NewShippmentOrderPageComponent implements OnInit {
  dataService: any;
  ngOnInit(): void {
    this.checklistService.checklistsGet()
      .subscribe(x => this.allChecklists.set(x));
  }

  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csInquiryService = inject(CsinquiriesService);
  tlInquiryService = inject(TlinquiriesService);

  allChecklists = signal<ChecklistDto[]>([]);

  csId = signal(1);
  tlId = signal(1);
  customerName = signal('');
  createdBy = signal('');
  status = signal(1);
  amount = signal(1);
  checklistId = signal(1);
  userText = signal('');

  //TlData
  inquiryNumber = signal(1);
  sped = signal('Test');
  country = signal('Test');
  acceptingPort = signal('Test');
  expectedRetrieveWeek = signal('17.12.2023');
  weightInKg = signal(1);
  invoiceOn = signal('17.12.2023');
  retrieveDate = signal('17.12.2023');
  isContainer40 = signal(false);
  isContainerHc = signal(false);
  retrieveLocation = signal('Test');
  debtCapitalGeneralForerunEur = signal(1);
  debtCapitalMainDol = signal(1);
  debtCapitalTrailingDol = signal(1);
  portOfDeparture = signal('Test');
  ets = signal('17.12.2023');
  eta = signal('17.12.2023');
  boat = signal('Test');

  shippmentRequestPage() {
    this.router.navigateByUrl('/shippment-request-page');
  }

  addOrder(): void {
    let tlInquiry: AddTlinquiryDto = {
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
    };

    let csInquiry: AddCsinquiryDto = {
      container: 'TODO',
      abnumber: 1,
      bruttoWeightInKg: 1,
      incoterm: 'TODO',
      containersizeA: 1,
      containersizeB: 1,
      containersizeHc: 1,
      freeDetention: false,
      thctb: false,
      readyToLoad: '17.12.2023',
      loadingPlattform: 'TODO'
    };

    console.log(tlInquiry);

    this.csInquiryService.csinquiriesPost(csInquiry)
      .subscribe(csInquiryObj => {
        this.tlInquiryService.tlinquiriesPost(tlInquiry)
          .subscribe(tlInquiryObj => {
            let order: AddOrderDto = {
              customerName: this.customerName(),
              status: this.status(),
              createdBy: this.createdBy(),
              amount: this.amount(),
              checklistId: this.checklistId(),
              csid: csInquiryObj.id,
              tlid: tlInquiryObj.id
            };

            this.orderService.ordersPost(order)
              .subscribe(x => console.log(x));
          });
      });

    this.router.navigateByUrl('/shippment-request-page');
  }
}
