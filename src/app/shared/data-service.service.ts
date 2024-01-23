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
  spedNumbersForOrder = new Map<number, string>;
  plantsForOrder = new Map<number, string>;
  factoriesForOrder = new Map<number, string>;
  articleNumbersForOrder = new Map<number, string>;
  countryForOrder = new Map<number, string>;
  recieveLocationForOrder = new Map<number, string>;

  constructor() {
    this.refreshPage('none', '');
  }

  refreshPage(selectedFilter: string, value: string) {
    console.log("GETTING ORDERS: selectedFilter: " + selectedFilter + " value: " + value);
    if (value === "") {
      selectedFilter = 'none';
    }
    switch (selectedFilter) {
      case "none":
        console.log('case none');
        this.orderService.ordersGet()
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      case "customername":
        console.log('case customername');
        this.orderService.ordersCustomernameGet(value)
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      case "createdBy":
        console.log('case create by');
        this.orderService.ordersCreatedByGet(value)
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      case "status":
        console.log('case status');
        this.orderService.ordersStatusGet(parseInt(value))
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      case "approved":
        console.log('case approved ' + JSON.parse(value));
        this.orderService.ordersApprovedGet(JSON.parse(value))
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      case "amount":
        console.log('case amount');
        this.orderService.ordersAmountGet(parseInt(value))
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      case "lastUpdated":
        console.log('case last udpated');
        this.orderService.ordersLastUpdatedGet(value)
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      case "country":
        console.log('case country');
        this.orderService.ordersCountryGet(value)
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      case "sped":
        console.log('case sped');
        this.orderService.ordersSpedGet(value)
          .subscribe(x => {
            this.getDetilsForOrder(x);
          });
        break;
      default:
        console.log('default');
        break;
    }
  }

  getDetilsForOrder(x: OrderDto[]) {
    this.allOrders.set(x);
    this.allOrders().forEach(currOrder => {
      this.allAbNumbers().push(currOrder.id);
      this.csinquiryService.csinquiriesIdGet(currOrder.csid)
        .subscribe(x => this.articleNumbersForOrder.set(currOrder.id, x.articleNumber));

      this.tlinquiryService.tlinquiriesIdGet(currOrder.tlid)
        .subscribe(x => this.spedNumbersForOrder.set(currOrder.id, x.sped));

      this.tlinquiryService.tlinquiriesIdGet(currOrder.tlid)
        .subscribe(x => this.countryForOrder.set(currOrder.id, x.country));

      this.tlinquiryService.tlinquiriesIdGet(currOrder.tlid)
        .subscribe(x => this.recieveLocationForOrder.set(currOrder.id, x.retrieveLocation));
    });
  }
}
