import { Injectable, inject, signal } from '@angular/core';
import { CsinquiriesService, CsinquiryDto, OrderDto, OrdersService, TlinquiriesService } from './swagger';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  orderService = inject(OrdersService);
  csinquiryService = inject(CsinquiriesService);
  tlinquiryService = inject(TlinquiriesService);
  allOrders = signal<OrderDto[]>([]);
  allAbNumbers = signal<number[]>([]);
  allArticleIds = signal<number[]>([]);
  articleNumbersForOrder = new Map<number, string>;
  countryForOrder = new Map<number, string>;
  recieveLocationForOrder = new Map<number, string>;

  constructor() {
    this.refreshPage();
  }

  refreshPage(){
    console.log("GETTING ORDERS");
    this.orderService.ordersGetAllOrdersGet()
      .subscribe(x => {
        this.allOrders.set(x);
        this.allOrders().forEach(currOrder => {
          this.allAbNumbers().push(currOrder.id);
          this.csinquiryService.csinquiriesGetCsinquiryWithIdGetCsinquiryWithIdIdGet(currOrder.csid)
          .subscribe(x => this.articleNumbersForOrder.set(currOrder.id, x.articleNumber));

          this.tlinquiryService.tlinquiriesGetTlinquiryWithIdGetTlinquiryWithIdIdGet(currOrder.tlid)
          .subscribe(x => this.countryForOrder.set(currOrder.id, x.country));

          this.tlinquiryService.tlinquiriesGetTlinquiryWithIdGetTlinquiryWithIdIdGet(currOrder.tlid)
          .subscribe(x => this.recieveLocationForOrder.set(currOrder.id, x.retrieveLocation));
        });
        console.log(this.allAbNumbers());
      });
  }
}
