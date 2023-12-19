import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditCsinquiryDto, EditOrderDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective],
  templateUrl: './edit-container-request-order-page.component.html',
  styleUrl: './edit-container-request-order-page.component.scss'
})
export class EditContainerOrderPageComponent implements OnChanges {
  @Input({ transform: numberAttribute }) id = 0;
  dataService: any;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('id: ' + this.id);
    this.checklistService.checklistsGet()
      .subscribe(x => {
        this.allCheckliststs.set(x);

      });
    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        this.currOrder.set(x);
        console.log(this.currOrder());
        this.setOrderSignals();
        this.csinquiriesService.csinquiriesIdGet(this.csId())
          .subscribe(x => {
            this.currCsInquiry.set(x);
            this.setCsInquirySignals();
          });
      });
  }

  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csinquiriesService = inject(CsinquiriesService);

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
  allCheckliststs = signal<ChecklistDto[]>([]);
  currCsInquiry = signal<CsinquiryDto>(
    {
      id: 1,
      container: 'Loading',
      fastLine: 'Loading',
      directLine: 'Loading',
      articleNumber: 'Loading',
      palletamount: 0,
      customer: 'Loading',
      abnumber: 1,
      bruttoWeightInKg: 0,
      incoterm: 'Loading',
      containersizeA: 0,
      containersizeB: 0,
      containersizeHc: 0,
      freeDetention: false,
      thctb: false,
      readyToLoad: '01.01.1999',
      loadingPlattform: 'Loading'
    });

  //OrderData
  csId = signal(this.currOrder().csid);
  customerName = signal(this.currOrder().customerName);
  createdBy = signal(this.currOrder().createdBy);
  status = signal(this.currOrder().status);
  amount = signal(this.currOrder().amount);
  checklistId = signal(this.currOrder().checklistId);
  isApproved = signal(this.currOrder().approved);

  //CsData
  container = signal(this.currCsInquiry().container);
  fastLine = signal(this.currCsInquiry().fastLine);
  directLine = signal(this.currCsInquiry().directLine);
  articleNumber = signal(this.currCsInquiry().articleNumber);
  palletamount = signal(this.currCsInquiry().palletamount);
  customer = signal(this.currCsInquiry().customer);
  abnumber = signal(this.currCsInquiry().abnumber);
  bruttoWeightInKg = signal(this.currCsInquiry().bruttoWeightInKg);
  incoterm = signal(this.currCsInquiry().incoterm);
  containersizeA = signal(this.currCsInquiry().containersizeA);
  containersizeB = signal(this.currCsInquiry().containersizeB);
  containersizeHc = signal(this.currCsInquiry().containersizeHc);
  freeDetention = signal(this.currCsInquiry().freeDetention);
  thctb = signal(this.currCsInquiry().thctb);
  readyToLoad = signal(this.currCsInquiry().readyToLoad);
  loadingPlattform = signal(this.currCsInquiry().loadingPlattform);

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

    this.saveCsInquery();

    this.router.navigateByUrl('/shippment-request-page');
  }

  saveCsInquery() {
    let editedCsInquery: EditCsinquiryDto = {
      id: this.currCsInquiry().id,
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
      loadingPlattform: this.loadingPlattform(),
    }

    this.csinquiriesService.csinquiriesPut(editedCsInquery)
    .subscribe(x => console.log('RETURN VALUE OF CSINQUERY SAVE: ' + x.id + x.abnumber + x.freeDetention + x.readyToLoad));
  }

  setOrderSignals() {
    this.csId = signal(this.currOrder().csid);
    this.customerName = signal(this.currOrder().customerName);
    this.createdBy = signal(this.currOrder().createdBy);
    this.status = signal(this.currOrder().status);
    this.amount = signal(this.currOrder().amount);
    this.checklistId = signal(this.currOrder().checklistId);
    this.isApproved = signal(this.currOrder().approved);
  }

  setCsInquirySignals() {
    this.container = signal(this.currCsInquiry().container);
    this.directLine = signal(this.currCsInquiry().directLine);
    this.articleNumber = signal(this.currCsInquiry().articleNumber);
    this.palletamount = signal(this.currCsInquiry().palletamount);
    this.customer = signal(this.currCsInquiry().customer);
    this.abnumber = signal(this.currCsInquiry().abnumber);
    this.bruttoWeightInKg = signal(this.currCsInquiry().bruttoWeightInKg);
    this.incoterm = signal(this.currCsInquiry().incoterm);
    this.containersizeA = signal(this.currCsInquiry().containersizeA);
    this.containersizeB = signal(this.currCsInquiry().containersizeB);
    this.containersizeHc = signal(this.currCsInquiry().containersizeHc);
    this.freeDetention = signal(this.currCsInquiry().freeDetention);
    this.thctb = signal(this.currCsInquiry().thctb);
    this.readyToLoad = signal(this.currCsInquiry().readyToLoad);
    this.loadingPlattform = signal(this.currCsInquiry().loadingPlattform);
    this.fastLine = signal(this.currCsInquiry().fastLine);
  }
}
