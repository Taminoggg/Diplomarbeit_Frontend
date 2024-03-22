import { Injectable, inject, signal } from '@angular/core';
import { ArticlesPPService, CsinquiriesService, OrderDto, OrderOrdersDto, OrdersService, ProductionPlanningsService, TlinquiriesService } from './swagger';
import { HttpBackend, HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  http = inject(HttpClient);
  orderService = inject(OrdersService);
  csinquiryService = inject(CsinquiriesService);
  tlinquiryService = inject(TlinquiriesService);
  productionService = inject(ProductionPlanningsService);
  articlePPService = inject(ArticlesPPService);
  allOrders = signal<OrderDto[]>([]);
  lastSortedBy = signal('');
  articlesForOrder = new Map<number, string[]>();
  abNumberForOrder = new Map<number, number>();
  readyToLoadForOrder = new Map<number, string>();
  countryForOrder = new Map<number, string>();
  spedForOrder = new Map<number, string>();
  factoriesForOrder = new Map<number, string[]>();
  plantsForOrder = new Map<number, string[]>();
  orderIds: number[] = [];
  approvedBy = new Map<number, boolean>();
  tableHeaders: { label: string; value: (keyof OrderDto | 'readyToLoad' | 'country' | 'abNumber' | 'sped' | 'approvedBy' | 'articleNumbers' | 'factory' | 'plant' | 'assignment' | 'create' | 'chat') }[] = [];
  filteredBy = '';
  filterByName = ''
  showFinished = false;
  showCanceled = false;
  dataLoading = signal(false);

  getOrdersOrderedBy(orderString: string): void {
    switch (orderString) {

      case "customerName":
        if (this.lastSortedBy() === "customer") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.customerName);
        } else {
          this.lastSortedBy.set('customer');
          this.allOrders().orderBy(x => x.customerName);
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

      case "createdByCS":
        if (this.lastSortedBy() === "createdByCS") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.createdByCS);
        } else {
          this.lastSortedBy.set('createdByCS');
          this.allOrders().orderBy(x => x.createdByCS);
        }
        break;

        case "createdBySD":
        if (this.lastSortedBy() === "createdBySD") {
          this.lastSortedBy.set('');
          this.allOrders().orderByDescending(x => x.createdBySD);
        } else {
          this.lastSortedBy.set('createdBySD');
          this.allOrders().orderBy(x => x.createdBySD);
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

      case "sped":
        let orderOrdersSpedDto: OrderOrdersDto;
        if (this.lastSortedBy() === "sped") {
          this.lastSortedBy.set('');
          orderOrdersSpedDto = {
            orderIds: this.allOrders().map(x => x.id),
            asc: true
          }
        } else {
          this.lastSortedBy.set('sped');
          orderOrdersSpedDto = {
            orderIds: this.allOrders().map(x => x.id),
            asc: false
          }
        }
        this.orderService.ordersOrderedBySpedPut(orderOrdersSpedDto).subscribe(x => this.allOrders.set(x));
        break;

      case "country":
        console.log('country clicked');
        let orderOrdersCountryDto: OrderOrdersDto;
        if (this.lastSortedBy() === "country") {
          this.lastSortedBy.set('');
          orderOrdersCountryDto = {
            orderIds: this.allOrders().map(x => x.id),
            asc: true
          }
        } else {
          this.lastSortedBy.set('country');
          orderOrdersCountryDto = {
            orderIds: this.allOrders().map(x => x.id),
            asc: false
          }
        }
        console.log(orderOrdersCountryDto);
        this.orderService.ordersOrderedByCountryPut(orderOrdersCountryDto).subscribe(x => this.allOrders.set(x));
        break;

      case "readyToLoad":
        let orderOrdersReadyToLoadDto: OrderOrdersDto;
        if (this.lastSortedBy() === "readyToLoad") {
          this.lastSortedBy.set('');
          orderOrdersReadyToLoadDto = {
            orderIds: this.allOrders().map(x => x.id),
            asc: true
          }
        } else {
          this.lastSortedBy.set('readyToLoad');
          orderOrdersReadyToLoadDto = {
            orderIds: this.allOrders().map(x => x.id),
            asc: false
          }
        }
        this.orderService.ordersOrderedByReadyToLoadPut(orderOrdersReadyToLoadDto).subscribe(x => this.allOrders.set(x));
        break;

      case "abNumber":
        let orderOrdersAbnumberDto: OrderOrdersDto;
        if (this.lastSortedBy() === "abNumber") {
          this.lastSortedBy.set('');
          orderOrdersAbnumberDto = {
            orderIds: this.allOrders().map(x => x.id),
            asc: true
          }
        } else {
          this.lastSortedBy.set('abNumber');
          orderOrdersAbnumberDto = {
            orderIds: this.allOrders().map(x => x.id),
            asc: false
          }
        }
        this.orderService.ordersOrderedByAbnumberPut(orderOrdersAbnumberDto).subscribe(x => this.allOrders.set(x));
        break;
    }
  }

  refreshPage(selectedFilter: string, value: string, filteredBy: string, filterByName: string, showFinished: boolean, showCanceled: boolean): void {
    this.dataLoading.set(true);
    console.log("GETTING ORDERS: selectedFilter: " + selectedFilter + " value: " + value);
    if (value === '') {
      selectedFilter = 'none';
    }

    this.filteredBy = filteredBy;
    this.filterByName = filterByName;
    this.showCanceled = showCanceled;
    this.showFinished = showFinished;

    switch (selectedFilter) {
      case "none":
        console.log('case none');
        this.orderService.ordersGet()
          .subscribe(x => {
            this.getDetailsForOrder(x);
          });
        break;
      case "customername":
        console.log('case customername');
        this.orderService.ordersCustomernameGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x);
          });
        break;
      case "status":
        console.log('case status');
        this.orderService.ordersStatusGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x);
          });
        break;
      case "approvedByCs":
        console.log('case approvedByCs ' + JSON.parse(value));
        this.orderService.ordersGet()
          .subscribe(orders => {
            this.getDetailsForOrder(orders);
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
                    this.filteredBy = '';
                    this.getDetailsForOrder(filteredOrdersCs());
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
                    this.getDetailsForOrder(filteredOrdersTl());
                  }
                });
            });
          });
        break;
      case "approvedByPp":
        console.log('case approvedByPp ' + JSON.parse(value));
        this.orderService.ordersApprovedByPpGet(JSON.parse(value))
          .subscribe(x => {
            this.getDetailsForOrder(x);
          });
        break;
      case "approvedByPpCs":
        console.log('case approvedByPpCs ' + JSON.parse(value));
        this.orderService.ordersApprovedByPpCsGet(JSON.parse(value))
          .subscribe(x => {
            this.getDetailsForOrder(x);
          });
        break;
      case "lastUpdated":
        console.log('case last udpated');
        this.orderService.ordersLastUpdatedGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x);
          });
        break;
      case "sped":
        console.log('case sped');
        this.orderService.ordersSpedGet(value)
          .subscribe(x => {
            this.getDetailsForOrder(x);
          });
        break;
      default:
        console.log('default');
        break;
    }
  }

  getDetailsForOrder(x: OrderDto[]) {
    this.orderIds = [];
    this.allOrders.set(x);

    if (!this.showCanceled) {
      this.allOrders.set(this.allOrders().filter(x => x.canceled === false));
    }

    if (!this.showFinished) {
      this.allOrders.set(this.allOrders().filter(x => x.successfullyFinished === false));
    }

    if (this.filteredBy === "containerRequestCS" || this.filteredBy === "containerRequestTL") {
      this.allOrders.set(this.allOrders().filter(x => x.createdByCS.toLowerCase().includes(this.filterByName.toLowerCase())));
      this.allOrders.set(this.allOrders().filter(x => x.csid > 0 && x.tlid > 0));
      this.allOrders().forEach(order => this.csinquiryService.csinquiriesIdGet(order.csid).subscribe(x => this.countryForOrder.set(order.id, x.country)));
      this.allOrders().forEach(order => this.csinquiryService.csinquiriesIdGet(order.csid).subscribe(x => this.abNumberForOrder.set(order.id, x.abnumber)));
      this.allOrders().forEach(order => this.csinquiryService.csinquiriesIdGet(order.csid).subscribe(x => this.readyToLoadForOrder.set(order.id, x.readyToLoad)));
      this.allOrders().forEach(order => this.tlinquiryService.tlinquiriesIdGet(order.tlid).subscribe(x => this.spedForOrder.set(order.id, x.sped)));
      if (this.filteredBy === "containerRequestCS") {
        this.allOrders().forEach(order => this.csinquiryService.csinquiriesIdGet(order.csid).subscribe(x => this.approvedBy.set(order.id, x.approvedByCrCs)));
      } else {
        this.allOrders().forEach(order => this.tlinquiryService.tlinquiriesIdGet(order.tlid).subscribe(x => this.approvedBy.set(order.id, x.approvedByCrTl)));
        this.filterForApprovedByCrCs();
        return;
      }
    } else if (this.filteredBy === "productionPlanningCS" || this.filteredBy === "productionPlanningPP") {
      this.allOrders.set(this.allOrders().filter(x => x.createdBySD.toLowerCase().includes(this.filterByName.toLowerCase())));
      this.allOrders.set(this.allOrders().filter(x => x.ppId > 0));
      this.allOrders().forEach(order => this.articlePPService.articlesPPProductionPlanningIdGet(order.ppId).subscribe(x => this.articlesForOrder.set(order.id, x.map(x => x.articleNumber.toString()))));
      this.allOrders().forEach(order => this.articlePPService.articlesPPProductionPlanningIdGet(order.ppId).subscribe(x => this.plantsForOrder.set(order.id, x.map(x => x.plant))));
      this.allOrders().forEach(order => this.articlePPService.articlesPPProductionPlanningIdGet(order.ppId).subscribe(x => this.factoriesForOrder.set(order.id, x.map(x => x.factory))));
      if (this.filteredBy === "productionPlanningCS") {
        this.allOrders().forEach(order => this.productionService.productionPlanningsIdGet(order.ppId).subscribe(x => this.approvedBy.set(order.id, x.approvedByPpCs)));
      } else {
        this.allOrders().forEach(order => this.productionService.productionPlanningsIdGet(order.ppId).subscribe(x => this.approvedBy.set(order.id, x.approvedByPpPp)));
        this.filterForApprovedByPpCs();
        return;
      }
    }

    this.allOrders().forEach(currOrder => {
      this.orderIds.push(currOrder.id)
    });

    this.dataLoading.set(false);
  }

  filterForApprovedByPpCs() {
    let filteredOrdersPpCs = signal<OrderDto[]>([]);
    let totalOrders = this.allOrders().length;
    let processedOrders = 0;

    this.allOrders().forEach(order => {
      this.productionService.productionPlanningsIdGet(order.ppId)
        .subscribe(x => {
          if (x.approvedByPpCs === true) {
            filteredOrdersPpCs().push(order);
          }
          processedOrders++;

          if (processedOrders === totalOrders) {
            this.filteredBy = '';
            this.getDetailsForOrder(filteredOrdersPpCs());
          }
        });
    });
  }

  filterForApprovedByCrCs() {
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
            this.filteredBy = '';
            this.getDetailsForOrder(filteredOrdersTl());
          }
        });
    });
  }
}