import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataServiceService } from '../shared/data-service.service';
import { MatIconModule } from '@angular/material/icon'
import { CsinquiriesService, CsinquiryDto } from '../shared/swagger';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog'
import { ChecklistPopUpComponent } from '../checklist-pop-up/checklist-pop-up.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-container-request-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  templateUrl: './container-request-page.component.html',
  styleUrls: ['./container-request-page.component.scss']
})
export class ContainerRequestPageComponent {

  dataService = inject(DataServiceService);
  router = inject(Router);
  csinquiryService = inject(CsinquiriesService);
  dialogRef = inject(MatDialog);
  csinquiry = signal<CsinquiryDto | undefined>(undefined);

  getApprovedString(approved:boolean) :string{
    if(approved){
      return 'JA';
    }
    return 'NEIN';
  }

  openDialog(id:number){
    this.dialogRef.open(ChecklistPopUpComponent, {data: {
      id: id
    }});
  }

  addOrderPage(){
    this.router.navigateByUrl('/new-order-page');
  }

  editOrderPage(id:number){
    this.router.navigateByUrl('/edit-order-page/'+ id);
  }
}