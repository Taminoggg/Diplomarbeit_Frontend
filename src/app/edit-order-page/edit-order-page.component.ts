import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective],
  templateUrl: './edit-order-page.component.html',
  styleUrl: './edit-order-page.component.scss'
})
export class EditOrderPageComponent implements OnChanges {
  @Input({ transform: numberAttribute }) id = 0;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('id: ' + this.id);
    this.checklistService.checklistsGetAllChecklistsGet()
      .subscribe(x => this.allCheckliststs.set(x));

    this.csinquiriesService.csinquiriesGetAllCsinquiriesGet()
      .subscribe(x => this.allCsInquiries.set(x));

    this.tlinquiriesService.tlinquiriesGetAllCsinquiriesGet()
      .subscribe(x => this.allTlInquiries.set(x));

    this.orderService.ordersGetOrderWithIdGetOrderWithIdIdGet(this.id)
      .subscribe(x => {
        this.currOrder.set(x);
        console.log(this.currOrder());
        this.setSignals();
      });
  }

  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csinquiriesService = inject(CsinquiriesService);
  tlinquiriesService = inject(TlinquiriesService);

  currOrder = signal<OrderDto>({ id: 1, status: 1, customerName: 'Test', createdBy: 'Test', approved: false, amount: 0, lastUpdated: 'Test', checklistId: 1, csid: 1, tlid: 2 });
  allCheckliststs = signal<ChecklistDto[]>([]);
  allCsInquiries = signal<CsinquiryDto[]>([]);
  allTlInquiries = signal<TlinquiryDto[]>([]);

  csId = signal(this.currOrder().csid);
  tlId = signal(this.currOrder().tlid - 1);
  customerName = signal(this.currOrder().customerName);
  createdBy = signal(this.currOrder().createdBy);
  status = signal(this.currOrder().status);
  amount = signal(this.currOrder().amount);
  checklistId = signal(this.currOrder().checklistId);
  isApproved = signal(this.currOrder().approved);

  saveOrder():void{
    let order:OrderDto = {
      customerName: this.customerName(),
      status: this.status(),
      createdBy: this.createdBy(),
      amount: this.amount(),
      checklistId: this.checklistId(),
      csid: this.csId(),
      tlid: this.tlId(),
      id: this.id,
      approved: this.isApproved(),
      lastUpdated: new Date().toDateString()
    };

    let orderLog = this.orderService.ordersEditOrderEditOrderPut(order);
    console.log(orderLog);
  }

  setSignals() {
    this.csId = signal(this.currOrder().csid);
    this.tlId = signal(this.currOrder().tlid);
    this.customerName = signal(this.currOrder().customerName);
    this.createdBy = signal(this.currOrder().createdBy);
    this.status = signal(this.currOrder().status);
    this.amount = signal(this.currOrder().amount);
    this.checklistId = signal(this.currOrder().checklistId);
    this.isApproved = signal(this.currOrder().approved);
  }
}
