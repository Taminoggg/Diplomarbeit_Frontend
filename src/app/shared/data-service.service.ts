import { Injectable, inject, signal } from '@angular/core';
import { CsinquiriesService, OrderDto, OrdersService, TlinquiriesService } from './swagger';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  orderService = inject(OrdersService);
  csinquiryService = inject(CsinquiriesService);
  tlinquiryService = inject(TlinquiriesService);
  allOrders = signal<OrderDto[]>([]);
  lastSortedBy = signal('');
  orderIds: number[] = [];

  constructor() {
    this.refreshPage('none', '');
  }

  getOrdersOrderedBy(orderString: string): void {
    switch (orderString) {

      case "amount":
        if (this.lastSortedBy() === "amount") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.amount);
        } else {
          this.lastSortedBy.set('amount');
          this.allOrders().orderBy(x => x.amount);
        }
        break;

      case "sped":
        if (this.lastSortedBy() === "sped") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.sped);
        }else{
          this.lastSortedBy.set('sped');
          this.allOrders().orderBy(x => x.sped);
        }
        break;

      case "customer":
        if (this.lastSortedBy() === "customer") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.customerName);
        }else{
          this.lastSortedBy.set('customer');
          this.allOrders().orderBy(x => x.customerName);
        }
        break;

      case "createdBy":
        if (this.lastSortedBy() === "createdBy") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.createdBy);
        }else{
          this.lastSortedBy.set('createdBy');
          this.allOrders().orderBy(x => x.createdBy);
        }
        break;

      case "status":
        if (this.lastSortedBy() === "status") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.status);
        }else{    
          this.lastSortedBy.set('status');
          this.allOrders().orderBy(x => x.status);
        }
        break;

        case "lastUpdated":
          if (this.lastSortedBy() === "lastUpdated") {
            this.lastSortedBy.set('');
            this.allOrders().orderByDescending(x => x.lastUpdated);
          }else{    
            this.lastSortedBy.set('lastUpdated');
            this.allOrders().orderBy(x => x.lastUpdated);
          }
          break;

          case "abNr":
            if (this.lastSortedBy() === "abNr") {
              this.lastSortedBy.set('');
              this.allOrders().orderByDescending(x => x.abNumber);
            }else{    
              this.lastSortedBy.set('abNr');
              this.allOrders().orderBy(x => x.abNumber);
            }
            break;

            case "readyToLoad":
            if (this.lastSortedBy() === "readyToLoad") {
              this.lastSortedBy.set('');
              this.allOrders().orderByDescending(x => x.readyToLoad);
            }else{    
              this.lastSortedBy.set('readyToLoad');
              this.allOrders().orderBy(x => x.readyToLoad);
            }
            break;
    }
  }

  refreshPage(selectedFilter: string, value: string): void {
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
    this.orderIds = [];
    this.allOrders.set(x);
    this.allOrders().forEach(currOrder => {
      this.orderIds.push(currOrder.id)
    });
  }
}
