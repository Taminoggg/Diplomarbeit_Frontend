import { Injectable, inject, signal } from '@angular/core';
import { ArticlesPPService, CsinquiriesService, OrderDto, OrdersService, TlinquiriesService } from './swagger';
import { HttpBackend, HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  http = inject(HttpClient);
  orderService = inject(OrdersService);
  csinquiryService = inject(CsinquiriesService);
  tlinquiryService = inject(TlinquiriesService);
  articlePPService = inject(ArticlesPPService);
  allOrders = signal<OrderDto[]>([]);
  lastSortedBy = signal('');
  articlesForOrder = new Map<number, number[]>();
  factoriesForOrder = new Map<number, string[]>();
  plantsForOrder = new Map<number, string[]>();
  orderIds: number[] = [];
  tableHeaders: { label: string; value: (keyof OrderDto | 'approvedByPpPp' | 'approvedByPpCs' | 'approvedByCrTl' | 'approvedByCrCs' | 'articleNumbers' | 'factory' | 'plant' | 'assignment' | 'create' | 'chat') }[] = [];

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
        } else {
          this.lastSortedBy.set('sped');
          this.allOrders().orderBy(x => x.sped);
        }
        break;

      case "customer":
        if (this.lastSortedBy() === "customer") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.customerName);
        } else {
          this.lastSortedBy.set('customer');
          this.allOrders().orderBy(x => x.customerName);
        }
        break;

      case "createdBy":
        if (this.lastSortedBy() === "createdBy") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.createdBy);
        } else {
          this.lastSortedBy.set('createdBy');
          this.allOrders().orderBy(x => x.createdBy);
        }
        break;

      case "status":
        if (this.lastSortedBy() === "status") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.status);
        } else {
          this.lastSortedBy.set('status');
          this.allOrders().orderBy(x => x.status);
        }
        break;

      case "lastUpdated":
        if (this.lastSortedBy() === "lastUpdated") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.lastUpdated);
        } else {
          this.lastSortedBy.set('lastUpdated');
          this.allOrders().orderBy(x => x.lastUpdated);
        }
        break;

      case "abNr":
        if (this.lastSortedBy() === "abNr") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.abNumber);
        } else {
          this.lastSortedBy.set('abNr');
          this.allOrders().orderBy(x => x.abNumber);
        }
        break;

      case "readyToLoad":
        if (this.lastSortedBy() === "readyToLoad") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.readyToLoad);
        } else {
          this.lastSortedBy.set('readyToLoad');
          this.allOrders().orderBy(x => x.readyToLoad);
        }
        break;
    }
  }

  refreshPage(selectedFilter: string, value: string, filteredBy: string): void {
    console.log("GETTING ORDERS: selectedFilter: " + selectedFilter + " value: " + value);
    if (value === "") {
      selectedFilter = 'none';
    }
    switch (selectedFilter) {
      case "none":
        console.log('case none');
        this.orderService.ordersGet()
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "customername":
        console.log('case customername');
        this.orderService.ordersCustomernameGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "createdBy":
        console.log('case create by');
        this.orderService.ordersCreatedByGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "status":
        console.log('case status');
        this.orderService.ordersStatusGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "approvedByCs":
        console.log('case approvedByCs ' + JSON.parse(value));
        this.orderService.ordersGet()
          .subscribe(orders => {
            this.getDetailsForOrder(orders, filteredBy);

            let totalOrders = orders.length;
            let processedOrders = 0;
            let filteredOrdersCs = signal<OrderDto[]>([]);

            orders.forEach(order => {
              this.csinquiryService.csinquiriesIdGet(order.csid)
                .subscribe(x => {
                  if (JSON.parse(value) === true) {
                    if (x.approvedByCrCs === true) {
                      filteredOrdersCs().push(order);
                    }
                  } else {
                    if (x.approvedByCrCs === false) {
                      filteredOrdersCs().push(order);
                    }
                  }
                  processedOrders++;

                  if (processedOrders === totalOrders) {
                    this.getDetailsForOrder(filteredOrdersCs(), '');
                  }
                });
            });
          });
        break;
      case "approvedByTl":
        console.log('case approvedByTl ' + JSON.parse(value));
        this.orderService.ordersGet()
          .subscribe(x => {
            this.allOrders.set(x);

            let filteredOrdersTl = signal<OrderDto[]>([]);
            let totalOrders = this.allOrders().length;
            let processedOrders = 0;
    
            this.allOrders().forEach(order => {
              this.tlinquiryService.tlinquiriesIdGet(order.tlid)
                .subscribe(x => {
                  if (JSON.parse(value) === true) {
                    if (x.approvedByCrTl === true) {
                      filteredOrdersTl().push(order);
                    }
                  } else {
                    if (x.approvedByCrTl === false) {
                      filteredOrdersTl().push(order);
                    }
                  }
                  processedOrders++;
    
                  if (processedOrders === totalOrders) {
                    this.getDetailsForOrder(filteredOrdersTl(), filteredBy);
                  }
                });
            });
          });
        break;
      case "approvedByPp":
        console.log('case approvedByPp ' + JSON.parse(value));
        this.orderService.ordersApprovedByPpGet(JSON.parse(value))
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "approvedByPpCs":
        console.log('case approvedByPpCs ' + JSON.parse(value));
        this.orderService.ordersApprovedByPpCsGet(JSON.parse(value))
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "amount":
        console.log('case amount');
        this.orderService.ordersAmountGet(parseInt(value))
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "lastUpdated":
        console.log('case last udpated');
        this.orderService.ordersLastUpdatedGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "country":
        console.log('case country');
        this.orderService.ordersCountryGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      case "sped":
        console.log('case sped');
        this.orderService.ordersSpedGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x, filteredBy);
          });
        break;
      default:
        console.log('default');
        break;
    }
  }

   getDetailsForOrder(x: OrderDto[], filteredBy: string) {
    this.orderIds = [];
    this.allOrders.set(x);

    console.log('test');
    console.log(filteredBy);
    if(filteredBy === "containerRequestCS"){
      console.log('artilces only for CR');
      console.log(this.allOrders());
      this.allOrders.set(this.allOrders().filter(x => x.csid > 0 && x.tlid > 0));
      console.log(this.allOrders());
    }else if (filteredBy === "containerRequestTL") {
      this.allOrders.set(this.allOrders().filter(x => x.csid > 0 && x.tlid > 0));
      this.filterForTlinquiry();
    }else if (filteredBy === "productionPlanningCS") {
      console.log('artilces only for PP');
      console.log(this.allOrders());
      this.allOrders.set(this.allOrders().filter(x => x.ppId > 0));
      console.log(this.allOrders());
    } else if (filteredBy === "productionPlanningPP") {
      this.allOrders.set(this.allOrders().filter(x => x.ppId > 0));
    }

    this.allOrders().forEach(currOrder => {
      this.orderIds.push(currOrder.id)
    });

    this.allOrders().forEach(order => this.articlePPService.articlesPPProductionPlanningIdGet(order.ppId).subscribe(x => this.articlesForOrder.set(order.id, x.map(x => x.articleNumber))));
    this.allOrders().forEach(order => this.articlePPService.articlesPPProductionPlanningIdGet(order.ppId).subscribe(x => this.plantsForOrder.set(order.id, x.map(x => x.plant))));
    this.allOrders().forEach(order => this.articlePPService.articlesPPProductionPlanningIdGet(order.ppId).subscribe(x => this.factoriesForOrder.set(order.id, x.map(x => x.factory))));
  }

  filterForTlinquiry() {
    console.log("🚀 ~ DataService ~ filterForTlinquiry ~ filterForTlinquiry:")
    let filteredOrdersTl = signal<OrderDto[]>([]);
    let totalOrders = this.allOrders().length;
    let processedOrders = 0;

    this.allOrders().forEach(order => {
      this.csinquiryService.csinquiriesIdGet(order.tlid)
        .subscribe(x => {
          if (x.approvedByCrCs === true) {
            filteredOrdersTl().push(order);
          }
          processedOrders++;

          if (processedOrders === totalOrders) {
            this.getDetailsForOrder(filteredOrdersTl(), '');
          }
        });
    });
  }
}