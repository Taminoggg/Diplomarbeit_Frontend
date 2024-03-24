import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../shared/data.service';
import { MatIconModule } from '@angular/material/icon'
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog'
import { MatDialog } from '@angular/material/dialog';
import { CsinquiriesService, CsinquiryDto } from '../../shared/swagger';
import { ChecklistPopUpComponent } from '../../checklist-pop-up/checklist-pop-up.component';
import { TranslocoModule } from '@ngneat/transloco';
import { NgSignalDirective } from '../../shared/ngSignal.directive';

@Component({
  selector: 'app-container-request-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, TranslocoModule, NgSignalDirective],
  templateUrl: './request-overview-page.component.html',
  styleUrls: ['./request-overview-page.component.scss']
})
export class ContainerRequestPageComponent implements OnInit, OnChanges {
  @Input() htmlContent = 'containerRequestTL'

  ngOnInit(): void {
    this.dataService.refreshPage('none', '', this.htmlContent, this.filterByName(), this.showFinished(), this.showCanceled());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const tableConfig = localStorage.getItem(this.htmlContent + 'tableConfig');
    if(localStorage.getItem('createdBy') ?? '' !== ''){
      this.filterByName.set(JSON.parse(localStorage.getItem('createdBy') ?? ''));
    }
    this.showCanceled.set(JSON.parse(localStorage.getItem('canceledOrders') ?? 'false'));
    this.showFinished.set(JSON.parse(localStorage.getItem('finishedOrders') ?? 'false'));

    if (tableConfig) {   
      this.dataService.tableHeaders = JSON.parse(tableConfig);
      return;
    }
    else if (this.htmlContent === "containerRequestCS") {
      this.dataService.tableHeaders = [
        { label: 'ab-nr', value: 'abNumber' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdByCS' },
        { label: 'status', value: 'status' },
        { label: 'approved', value: 'approvedBy' },
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
        { label: 'created-by', value: 'createdByCS' },
        { label: 'status', value: 'status' },
        { label: 'approved', value: 'approvedBy' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'sped', value: 'sped' },
        { label: 'edit', value: 'create' },
        { label: 'chat', value: 'chat' }
      ];
    } else if (this.htmlContent === "productionPlanningCS") {
      this.dataService.tableHeaders = [
        { label: 'created-on', value: 'createdOn' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdByCS' },
        { label: 'article', value: 'articleNumbers' },
        { label: 'status', value: 'status' },
        { label: 'approved', value: 'approvedBy' },
        { label: 'factory', value: 'factory' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'plant', value: 'plant' },
        { label: 'edit', value: 'create' },
        { label: 'chat', value: 'chat' }
      ];
    } else if (this.htmlContent === "productionPlanningPP") {
      this.dataService.tableHeaders = [
        { label: 'created-on', value: 'createdOn' },
        { label: 'customer', value: 'customerName' },
        { label: 'created-by', value: 'createdByCS' },
        { label: 'article', value: 'articleNumbers' },
        { label: 'status', value: 'status' },
        { label: 'approved', value: 'approvedBy' },
        { label: 'factory', value: 'factory' },
        { label: 'last-updated', value: 'lastUpdated' },
        { label: 'plant', value: 'plant' },
        { label: 'edit', value: 'create' },
        { label: 'chat', value: 'chat' }
      ];
    }
    localStorage.setItem(this.htmlContent + 'tableConfig', JSON.stringify(this.dataService.tableHeaders));
  }

  csinquiryService = inject(CsinquiriesService);
  dataService = inject(DataService);
  router = inject(Router);
  dialogRef = inject(MatDialog);

  filterByName = signal('');
  showFinished = signal(false);
  showCanceled = signal(false);
  selectedFilter = signal<string>('customername');
  filterValue = signal<string>('');
  csinquiry = signal<CsinquiryDto | undefined>(undefined);
  showApprovedByTl = signal(false);
  filterCsByApproved = signal(false);

  setSelectedFilter(value: string) {
    this.filterValue.set('');
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue(), this.htmlContent, this.filterByName(), this.showFinished(), this.showCanceled());

    this.selectedFilter.set(value);
    if (this.selectedFilter() === 'approvedByPp' || this.selectedFilter() === 'approvedByCs' || this.selectedFilter() === 'approvedByTl' || this.selectedFilter() === 'approvedByPpCs') {
      this.dataService.refreshPage(this.selectedFilter(), 'false', this.htmlContent, this.filterByName(), this.showFinished(), this.showCanceled());
    }
  }

  filterForCanceledOrders(){
    localStorage.setItem('canceledOrders', JSON.stringify(this.showCanceled()));
    this.filterOrders();
  }

  filterForShowFinishedOrders(){
    localStorage.setItem('finishedOrders', JSON.stringify(this.showFinished()));
    this.filterOrders();
  }

  filterForCreatedBy(){
    localStorage.setItem('createdBy', JSON.stringify(this.filterByName()));
    this.filterOrders();
  }

  getApprovedByForOrder(orderId: number): boolean {
    return this.dataService.approvedBy.get(orderId)!;
  }

  getArticlesForOrder(orderId: number): string[] {
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

  getCountryForOrder(orderId: number): string {
    if (this.dataService.countryForOrder.get(orderId)?.length ?? 0 > 0) {
      return this.dataService.countryForOrder.get(orderId)!;
    }
    return '';
  }

  getAbNumberForOrder(orderId: number): number {
      return this.dataService.abNumberForOrder.get(orderId)!;
  }

  getReadyToLoadForOrder(orderId: number): string {
    if (this.dataService.readyToLoadForOrder.get(orderId)?.length ?? 0 > 0) {
      return this.dataService.readyToLoadForOrder.get(orderId)!;
    }
    return '';
  }

  getSpedForOrder(orderId: number): string {
    if (this.dataService.spedForOrder.get(orderId)?.length ?? 0 > 0) {
      return this.dataService.spedForOrder.get(orderId)!;
    }
    return '';
  }

  orderOrders(orderString: string): void {
    this.dataService.getOrdersOrderedBy(orderString);
  }

  filterOrders() {
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue(), this.htmlContent, this.filterByName(), this.showFinished(), this.showCanceled());
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
        editPagePath = '/cs-container-order-page/edit/' + orderId;
        break;
      case 'containerRequestTL':
        editPagePath = '/edit-tl-container-order-page/' + orderId;
        console.log(editPagePath);
        break;
      case 'productionPlanningCS':
        editPagePath = '/cs-production-planning-order-page/edit/' + orderId;
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