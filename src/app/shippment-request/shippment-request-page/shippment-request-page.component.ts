import { Component, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChecklistPopUpComponent } from '../../checklist-pop-up/checklist-pop-up.component';
import { DataServiceService } from '../../shared/data-service.service';
import { CsinquiryDto } from '../../shared/swagger';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { NgSignalDirective } from '../../shared/ngSignal.directive';

@Component({
  selector: 'app-shippment-request',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, TranslocoModule, NgSignalDirective],
  templateUrl: './shippment-request-page.component.html',
  styleUrls: ['./shippment-request-page.component.scss']
})
export class ShippmentRequestComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue());
  }
  ngOnInit(): void {
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue());
  }

  selectedFilter = signal<string>('customername');
  filterValue = signal<string>('');

  setSelectedFilter(value: string) {
    this.dataService.refreshPage('none', '');
    this.selectedFilter.set(value);
    if (this.selectedFilter() === "approved") {
      this.dataService.refreshPage(this.selectedFilter(), "false");
    }
    this.filterValue.set('');
  }

  orderOrders(orderString:string):void{
    this.dataService.getOrdersOrderedBy(orderString);
  }

  filterOrders() {
    console.log(this.filterValue()); 

    this.dataService.refreshPage(this.selectedFilter(), this.filterValue());
  }

  dataService = inject(DataServiceService);
  router = inject(Router);
  dialogRef = inject(MatDialog);
  csinquiry = signal<CsinquiryDto | undefined>(undefined);

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