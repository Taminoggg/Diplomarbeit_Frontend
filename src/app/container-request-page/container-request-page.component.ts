import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataServiceService } from '../shared/data-service.service';
import { MatIconModule } from '@angular/material/icon'
import { CsinquiriesService, CsinquiryDto } from '../shared/swagger';
import { Router } from '@angular/router';

@Component({
  selector: 'app-container-request-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './container-request-page.component.html',
  styleUrls: ['./container-request-page.component.scss']
})
export class ContainerRequestPageComponent {
  dataService = inject(DataServiceService);
  router = inject(Router);
  csinquiryService = inject(CsinquiriesService);

  csinquiry = signal<CsinquiryDto | undefined>(undefined);

  getApprovedString(approved:boolean) :string{
    if(approved){
      return 'JA';
    }
    return 'NEIN';
  }

  getCsInqueryAbnumber(id:number) :number|undefined{
    this.csinquiryService.csinquiriesGetCsinquiryWithIdGetCsinquiryWithIdIdGet(id)
    .subscribe(x => this.csinquiry.set(x));

    return this.csinquiry()?.abnumber;
  }

  addOrderPage(){
    this.router.navigateByUrl('/new-order-page');
  }

  editOrderPage(id:number){
    this.router.navigateByUrl('/edit-order-page/'+ id);
  }
}
