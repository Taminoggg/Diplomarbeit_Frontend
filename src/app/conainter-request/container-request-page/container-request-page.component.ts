import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../shared/data.service';
import { MatIconModule } from '@angular/material/icon'
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog'
import { MatDialog } from '@angular/material/dialog';
import { ArticlesService, CsinquiriesService, CsinquiryDto, OrderDto } from '../../shared/swagger';
import { ChecklistPopUpComponent } from '../../checklist-pop-up/checklist-pop-up.component';
import { TranslocoModule } from '@ngneat/transloco';
import { NgSignalDirective } from '../../shared/ngSignal.directive';

@Component({
  selector: 'app-container-request-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, TranslocoModule, NgSignalDirective],
  templateUrl: './container-request-page.component.html',
  styleUrls: ['./container-request-page.component.scss']
})
export class ContainerRequestPageComponent implements OnInit, OnChanges {
  @Input() htmlContent = 'containerRequestTL'

  articleService = inject(ArticlesService);

  ngOnChanges(changes: SimpleChanges): void {
    const tableConfig = localStorage.getItem(this.htmlContent + 'tableConfig');

    if (tableConfig) {   
      this.dataService.tableHeaders = JSON.parse(tableConfig);
      console.log(this.dataService.tableHeaders);
      return;
    }
    else if (this.htmlContent === "containerRequestCS") {
      this.dataService.tableHeaders = [
        { label: 'order', value: 'id' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdBy' },
        { label: 'ab-nr', value: 'abNumber' },
        { label: 'status', value: 'status' },
        { label: 'approved', value: 'approvedByCrCs' },
        { label: 'amount', value: 'amount' },
        { label: 'country', value: 'country' },
        { label: 'ready-to-load', value: 'readyToLoad' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'sped', value: 'sped' },
        { label: 'checklist', value: 'assignment' },
        { label: 'edit', value: 'create' },
        { label: 'chat', value: 'chat' }
      ];
    } else if (this.htmlContent === "containerRequestTL") {
      this.dataService.tableHeaders = [
        { label: 'ab-nr', value: 'abNumber' },
        { label: 'ready-to-load', value: 'readyToLoad' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdBy' },
        { label: 'status', value: 'status' },
        { label: 'approved', value: 'approvedByCrTl' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'sped', value: 'sped' },
        { label: 'checklist', value: 'assignment' },
        { label: 'edit', value: 'create' },
        { label: 'chat', value: 'chat' }
      ];
    } else if (this.htmlContent === "productionPlanningCS") {
      this.dataService.tableHeaders = [
        { label: 'order', value: 'id' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdBy' },
        { label: 'article', value: 'articleNumbers' },
        { label: 'status', value: 'status' },
        { label: 'amount', value: 'amount' },
        { label: 'approved', value: 'approvedByPpCs' },
        { label: 'factory', value: 'factory' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'plant', value: 'plant' },
        { label: 'checklist', value: 'assignment' },
        { label: 'edit', value: 'create' },
        { label: 'chat', value: 'chat' }
      ];
    } else if (this.htmlContent === "productionPlanningPP") {
      this.dataService.tableHeaders = [
        { label: 'order', value: 'id' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdBy' },
        { label: 'article', value: 'articleNumbers' },
        { label: 'status', value: 'status' },
        { label: 'amount', value: 'amount' },
        { label: 'approved', value: 'approvedByPpPp' },
        { label: 'factory', value: 'factory' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'plant', value: 'plant' },
        { label: 'checklist', value: 'assignment' },
        { label: 'edit', value: 'create' },
        { label: 'chat', value: 'chat' }
      ];
    }
    localStorage.setItem(this.htmlContent + 'tableConfig', JSON.stringify(this.dataService.tableHeaders));
  }

  ngOnInit(): void {
    this.getFilteredOrders('none', '');
  }

  selectedFilter = signal<string>('customername');
  filterValue = signal<string>('');
  dataService = inject(DataService);
  router = inject(Router);
  csinquiryService = inject(CsinquiriesService);
  dialogRef = inject(MatDialog);
  csinquiry = signal<CsinquiryDto | undefined>(undefined);
  showApprovedByTl = signal(false);
  filterCsByApproved = signal(false);

  setSelectedFilter(value: string) {
    this.getFilteredOrders('none', '');

    this.selectedFilter.set(value);
    if (this.selectedFilter() === 'approvedByPp' || this.selectedFilter() === 'approvedByCs' || this.selectedFilter() === 'approvedByTl' || this.selectedFilter() === 'approvedByPpCs') {
      this.getFilteredOrders(this.selectedFilter(), "false");
    }

    this.filterValue.set('');
  }

  getArticlesForOrder(orderId: number): number[] {
    if (this.dataService.articlesForOrder.get(orderId)?.length ?? 0 > 0) {
      return this.dataService.articlesForOrder.get(orderId)!.distinct();
    }
    return [];
  }

  getFactoriesForOrder(orderId: number): string[] {
    if (this.dataService.factoriesForOrder.get(orderId)?.length ?? 0 > 0) {
      return this.dataService.factoriesForOrder.get(orderId)!.distinct();
    }
    return [];
  }

  getPlantsForOrder(orderId: number): string[] {
    if (this.dataService.plantsForOrder.get(orderId)?.length ?? 0 > 0) {
      return this.dataService.plantsForOrder.get(orderId)!.distinct();
    }
    return [];
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

  settingsPage(){
    this.router.navigateByUrl('settings-page/'+this.htmlContent);
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
      case 'productionPlanningPP':
        editPagePath = '/edit-pp-production-planning-order-page/' + orderId;
        break;
      default:
        editPagePath = '';
        break;
    }

    this.router.navigateByUrl(editPagePath);
  }
}