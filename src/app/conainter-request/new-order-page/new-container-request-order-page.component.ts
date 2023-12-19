import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCsinquiryDto, AddOrderDto, AddTlinquiryDto, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective],
  templateUrl: './new-container-request-order-page.component.html',
  styleUrl: './new-container-request-order-page.component.scss'
})
export class NewContainerOrderPageComponent implements OnInit {
  dataService: any;
  ngOnInit(): void {
    this.checklistService.checklistsGetAllChecklistsGet()
      .subscribe(x => this.allCheckliststs.set(x));
  }

  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csInquiryService = inject(CsinquiriesService);
  tlInquiryService = inject(TlinquiriesService);

  allCheckliststs = signal<ChecklistDto[]>([]);

  csId = signal(1);
  tlId = signal(1);
  customerName = signal('');
  createdBy = signal('');
  status = signal(1);
  amount = signal(1);
  checklistId = signal(1);

  //CsData
  container = signal('Test');
  fastLine = signal('Test');
  directLine = signal('Test');
  articleNumber = signal('Test');
  palletamount = signal(1);
  customer = signal('Test');
  abnumber = signal(0);
  bruttoWeightInKg = signal(1);
  incoterm = signal('Test');
  containersizeA = signal(1);
  containersizeB = signal(1);
  containersizeHc = signal(1);
  freeDetention = signal(false);
  thctb = signal(false);
  readyToLoad = signal('17.12.2023');
  loadingPlattform = signal('Test');

  addOrder(): void {
    let csInquiry: AddCsinquiryDto = {
      container: this.container(),
      fastLine: this.fastLine(),
      directLine: this.directLine(),
      articleNumber: this.articleNumber(),
      palletamount: this.palletamount(),
      customer: this.customer(),
      abnumber: this.abnumber(),
      bruttoWeightInKg: this.bruttoWeightInKg(),
      incoterm: this.incoterm(),
      containersizeA: this.containersizeA(),
      containersizeB: this.containersizeB(),
      containersizeHc: this.containersizeHc(),
      freeDetention: this.freeDetention(),
      thctb: this.thctb(),
      readyToLoad: this.readyToLoad(),
      loadingPlattform: this.loadingPlattform()
    };

    let tlInquiry: AddTlinquiryDto = {
      inquiryNumber: 1,
      sped: 'TODO',
      country: 'TODO',
      acceptingPort: 'TODO',
      expectedRetrieveWeek: '17.12.2023',
      weightInKg: 1,
      invoiceOn: '17.12.2023',
      retrieveDate: '17.12.2023',
      isContainer40: false,
      isContainerHc: false,
      retrieveLocation: 'TODO',
      debtCapitalGeneralForerunEur: 1,
      debtCapitalMainDol: 1,
      debtCapitalTrailingDol: 1,
      portOfDeparture: 'TODO',
      ets: '17.12.2023',
      eta: '17.12.2023',
      boat: 'TODO'
    };

    console.log(tlInquiry);

    this.csInquiryService.csinquiriesAddNewCsinquiryAddNewCsinquiryPost(csInquiry)
      .subscribe(csInquiryObj => {
        this.tlInquiryService.tlinquiriesAddNewTlinquiryAddNewTlinquiryPost(tlInquiry)
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
  
          this.orderService.ordersAddOrderAddNewOrderPost(order)
            .subscribe(x => console.log(x));
        });
      });

    this.router.navigateByUrl('/shippment-request-page');
  }
}
