import { Injectable, inject, signal } from '@angular/core';
import { CsinquiriesService, CsinquiryDto, OrderDto, OrdersService } from './swagger';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  orderService = inject(OrdersService);
  allOrders = signal<OrderDto[]>([]);
  
  constructor(){
    console.log("GETTING ORDERS");
    this.orderService.ordersGetAllOrdersGet()
      .subscribe(x => this.allOrders.set(x));
  }
}
