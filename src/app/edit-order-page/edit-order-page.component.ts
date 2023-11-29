import { Component, Input, OnInit, inject, numberAttribute, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddOrderDto, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective],
  templateUrl: './edit-order-page.component.html',
  styleUrl: './edit-order-page.component.scss'
})
export class EditOrderPageComponent implements OnInit {
  @Input({transform:numberAttribute}) id = 0;

  ngOnInit(): void {
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
    });
  }

  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csinquiriesService = inject(CsinquiriesService);
  tlinquiriesService = inject(TlinquiriesService);

  currOrder = signal<OrderDto>({id:1, status:1, customerName:'Test', createdBy:'Test', approved:false, amount:0, lastUpdated:'Test', checklistId:1, csid:1, tlid:2});
  allCheckliststs = signal<ChecklistDto[]>([]);
  allCsInquiries = signal<CsinquiryDto[]>([]);
  allTlInquiries = signal<TlinquiryDto[]>([]);

  csId = signal(this.currOrder().csid);
  tlId = signal(this.currOrder().tlid);
  customerName = signal(this.currOrder().customerName);
  createdBy = signal(this.currOrder().createdBy);
  status = signal(this.currOrder().status);
  amount = signal(this.currOrder().amount);
  checklistId = signal(this.currOrder().checklistId);
  //fix all select default values

  saveOrder():void{
    console.log('tlId: ' + this.tlId() + ' amount: ' + this.amount() + " customerName: " + this.customerName());
  }

  toNumber(id:string){
    console.log(id);
    return Number(id);
  }
}
