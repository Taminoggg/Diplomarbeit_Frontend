import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataServiceService } from '../../shared/data-service.service';
import { MatIconModule } from '@angular/material/icon'
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog'
import { MatDialog } from '@angular/material/dialog';
import { CsinquiriesService, CsinquiryDto, OrderDto } from '../../shared/swagger';
import { ChecklistPopUpComponent } from '../../checklist-pop-up/checklist-pop-up.component';
import { TranslocoModule } from '@ngneat/transloco';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-container-request-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, TranslocoModule, NgSignalDirective],
  templateUrl: './container-request-page.component.html',
  styleUrls: ['./container-request-page.component.scss']
})
export class ContainerRequestPageComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (this.htmlContent === "containerRequestCS") {
      this.tableHeaders = [
        { label: 'order', value: 'id' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdBy' },
        { label: 'ab-nr', value: 'abNumber' },
        { label: 'status', value: 'status' },
        { label: 'approved', value: 'approvedByCs' },
        { label: 'amount', value: 'amount' },
        { label: 'country', value: 'country' },
        { label: 'ready-to-load', value: 'readyToLoad' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'sped', value: 'sped' },
        { label: 'checklist', value: '' },
        { label: 'edit', value: '' },
        { label: 'chat', value: '' }
      ];

      this.orderProperties = [
        'id',
        'customerName',
        'createdBy',
        'abNumber',
        'status',
        'approvedByCs',
        'amount',
        'country',
        'readyToLoad',
        'lastUpdated',
        'sped'
      ];

    } else if (this.htmlContent === "containerRequestTL") {
      this.tableHeaders = [
        { label: 'ab-nr', value: 'abNumber' },
        { label: 'ready-to-load', value: 'readyToLoad' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdBy' },
        { label: 'status', value: 'status' },
        { label: 'approved', value: 'approvedByTl' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'sped', value: 'sped' },
        { label: 'checklist', value: '' },
        { label: 'edit', value: '' },
        { label: 'chat', value: '' }
      ];

      this.orderProperties = [
        'abNumber',
        'readyToLoad',
        'customerName',
        'createdBy',
        'status',
        'approvedByTl',
        'lastUpdated',
        'sped',
      ];
    } else if (this.htmlContent === "productionPlanningCS") {
      this.tableHeaders = [
        { label: 'order', value: 'id' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdBy' },
        { label: 'article', value: 'article' },
        { label: 'status', value: 'status' },
        { label: 'amount', value: 'amount' },
        { label: 'approved', value: 'approvedByTl' },
        { label: 'factory', value: 'factory' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'plant', value: 'plant' },
        { label: 'checklist', value: '' },
        { label: 'edit', value: '' },
        { label: 'chat', value: '' }
      ];

      this.orderProperties = [
        'id',
        'customerName',
        'createdBy',
        'id', // TODO
        'status',
        'amount',
        'approvedByTl',
        'id', // TODO
        'lastUpdated',
        'id', // TODO
      ];
    }else if(this.htmlContent === "productionPlanningTL"){
      this.tableHeaders = [
        { label: 'order', value: 'id' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdBy' },
        { label: 'article', value: 'article' },
        { label: 'status', value: 'status' },
        { label: 'amount', value: 'amount' },
        { label: 'approved', value: 'approvedByTl' },
        { label: 'factory', value: 'factory' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'plant', value: 'plant' },
        { label: 'checklist', value: '' },
        { label: 'edit', value: '' },
        { label: 'chat', value: '' }
      ];

      this.orderProperties = [
        'id',
        'customerName',
        'createdBy',
        'id', // TODO
        'status',
        'amount',
        'approvedByTl',
        'id', // TODO
        'lastUpdated',
        'id', // TODO
      ];
    }
  }

  ngOnInit(): void {
    this.getFilteredOrders('none', '');
  }

  translocoService = inject(TranslocoService);

  @Input() htmlContent = 'containerRequestTL'


  tableHeaders: { label: string; value: string }[] = [
    { label: 'order', value: 'id' },
    { label: 'customer', value: 'customerName' },
    { label: 'created-by', value: 'createdBy' },
    { label: 'ab-nr', value: 'abNumber' },
    { label: 'status', value: 'status' },
    { label: 'approved', value: 'approvedByCs' },
    { label: 'amount', value: 'amount' },
    { label: 'country', value: 'country' },
    { label: 'ready-to-load', value: 'readyToLoad' },
    { label: 'last-updated', value: 'lastUpdated' },
    { label: 'sped', value: 'sped' },
    { label: 'checklist', value: '' },
    { label: 'edit', value: '' },
    { label: 'chat', value: '' }
  ];

  orderProperties: (keyof OrderDto)[] = [];

  selectedFilter = signal<string>('customername');
  filterValue = signal<string>('');
  dataService = inject(DataServiceService);
  router = inject(Router);
  csinquiryService = inject(CsinquiriesService);
  dialogRef = inject(MatDialog);
  csinquiry = signal<CsinquiryDto | undefined>(undefined);
  showApprovedByTl = signal(false);

  filterCsByApproved = signal(false);

  setSelectedFilter(value: string) {
    this.getFilteredOrders('none', '');

    this.selectedFilter.set(value);
    if (this.selectedFilter() === "approvedByCs") {
      this.getFilteredOrders(this.selectedFilter(), "false");
    } else if (this.selectedFilter() === "approvedByTl") {
      this.getFilteredOrders(this.selectedFilter(), "false");
    }
    this.filterValue.set('');
  }

  getFilteredOrders(filter: string, filterString: string) {
    if (this.htmlContent !== "containerRequestCS") {
      this.dataService.refreshPage(filter, filterString, this.htmlContent);
    } else {
      this.dataService.refreshPage(filter, filterString, '');
    }
  }

  orderOrders(orderString: string): void {
    this.dataService.getOrdersOrderedBy(orderString);
  }

  filterOrders() {
    this.getFilteredOrders(this.selectedFilter(), this.filterValue());
  }

  openDialog(id: number) {
    this.dialogRef.open(ChecklistPopUpComponent, {
      data: {
        id: id
      }
    });
  }

  navigateToPage(path: string) {
    this.router.navigateByUrl(path);
  }

  navigateToEditPage(orderId: number) {
    let editPagePath: string;

    switch (this.htmlContent) {
      case 'containerRequestCS':
        editPagePath = '/edit-cs-container-order-page/' + orderId;
        break;
      case 'containerRequestTL':
        editPagePath = '/edit-tl-container-order-page/' + orderId;
        break;
      case 'productionPlanningCS':
        editPagePath = '/edit-cs-production-planning-order-page/' + orderId;
        break;
      default:
        editPagePath = '';
        break;
    }

    this.router.navigateByUrl(editPagePath);
  }
}