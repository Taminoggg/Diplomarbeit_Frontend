import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddOrderDto, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';

@Component({
  selector: 'app-new-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective],
  templateUrl: './new-order-page.component.html',
  styleUrl: './new-order-page.component.scss'
})
export class NewOrderPageComponent implements OnInit {
  ngOnInit(): void {
    this.checklistService.checklistsGetAllChecklistsGet()
    .subscribe(x => this.allCheckliststs.set(x));

    this.csinquiriesService.csinquiriesGetAllCsinquiriesGet()
    .subscribe(x => this.allCsInquiries.set(x));

    this.tlinquiriesService.tlinquiriesGetAllCsinquiriesGet()
    .subscribe(x => this.allTlInquiries.set(x));
  }

  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csinquiriesService = inject(CsinquiriesService);
  tlinquiriesService = inject(TlinquiriesService);

  allCheckliststs = signal<ChecklistDto[]>([]);
  allCsInquiries = signal<CsinquiryDto[]>([]);
  allTlInquiries = signal<TlinquiryDto[]>([]);

  csId = signal(1);
  tlId = signal(1);
  customerName = signal('');
  createdBy = signal('');
  status = signal(1);
  amount = signal(1);
  checklistId = signal(1);

  addOrder():void{
    let order:AddOrderDto = {
      customerName:this.customerName(),
      status:this.status(),
      createdBy:this.createdBy(),
      amount:this.amount(),
      checklistId:this.checklistId(),
      csid:this.csId(),
      tlid:this.tlId()
    };

    this.orderService.ordersAddOrderAddNewOrderPost(order)
    .subscribe(x => console.log(x));
  }
}
