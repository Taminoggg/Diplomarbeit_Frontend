import { Injectable, OnInit, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { OrderDto, OrdersService } from './swagger';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService implements OnInit, OnChanges {
  orderService = inject(OrdersService);
  allOrders = signal<OrderDto[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    console.log("GETTING ORDERS");
    this.orderService.ordersGetAllOrdersGet()
      .subscribe(x => this.allOrders.set(x));
  }

  ngOnInit(): void {
    console.log("GETTING ORDERS");
    this.orderService.ordersGetAllOrdersGet()
      .subscribe(x => this.allOrders.set(x));
  }
}
