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

@Component({
  selector: 'app-container-request-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule, TranslocoModule],
  templateUrl: './container-request-page.component.html',
  styleUrls: ['./container-request-page.component.scss']
})
export class ContainerRequestPageComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.dataService.refreshPage();
  }
  ngOnInit(): void {
    console.log('UPDATING.............................');
    this.dataService.refreshPage();
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

  addOrderPage() {
    this.router.navigateByUrl('/new-container-order-page');
  }

  editOrderPage(id: number) {
    this.router.navigateByUrl('/edit-container-order-page/' + id);
  }
}