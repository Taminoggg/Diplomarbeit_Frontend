import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
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
  @Input() showCs = 'cs'

  selectedFilter = signal<string>('customername');
  filterValue = signal<string>('');
  dataService = inject(DataServiceService);
  router = inject(Router);
  csinquiryService = inject(CsinquiriesService);
  dialogRef = inject(MatDialog);
  csinquiry = signal<CsinquiryDto | undefined>(undefined);

  ngOnChanges(changes: SimpleChanges): void {
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue());
  }
  ngOnInit(): void {
    this.dataService.refreshPage(this.selectedFilter(), this.filterValue());
  }

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