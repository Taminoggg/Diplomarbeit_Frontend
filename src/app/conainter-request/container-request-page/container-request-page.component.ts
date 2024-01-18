import { Component, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataServiceService } from '../../shared/data-service.service';
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
  templateUrl: './container-request-page.component.html',
  styleUrls: ['./container-request-page.component.scss']
})
export class ContainerRequestPageComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue());
  }
  ngOnInit(): void {
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue());
  }

  selectedFilter = signal<string>('Customername');
  filterValue = signal<string>('');

  setSelectedFilter(value: string) {
    this.dataService.refreshPage('None', '');
    this.selectedFilter.set(value);
    if (this.selectedFilter() === "Approved") {
      this.dataService.refreshPage(this.selectedFilter(), "false");
    }
    this.filterValue.set('');
  }

  filterOrders() {
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue());
  }

  dataService = inject(DataServiceService);
  router = inject(Router);
  csinquiryService = inject(CsinquiriesService);
  dialogRef = inject(MatDialog);
  csinquiry = signal<CsinquiryDto | undefined>(undefined);

  getArticleNumberForOrder(id: number): string {
    let articleNumber = this.dataService.articleNumbersForOrder.get(id);
    if (articleNumber !== undefined) {
      return articleNumber;
    }
    return '';
  }

  getRecieveLocationForOrder(id: number): string {
    let recieveLocationForOrder = this.dataService.recieveLocationForOrder.get(id);
    if (recieveLocationForOrder !== undefined) {
      return recieveLocationForOrder;
    }
    return '';
  }

  getCountryForOrder(id: number): string {
    let countryForOrder = this.dataService.countryForOrder.get(id);
    if (countryForOrder !== undefined) {
      return countryForOrder;
    }
    return '';
  }

  getApprovedString(approved: boolean): string {
    if (approved) {
      return 'JA';
    }
    return 'NEIN';
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
}