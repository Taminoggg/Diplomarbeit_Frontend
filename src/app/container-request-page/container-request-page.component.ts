import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataServiceService } from '../shared/data-service.service';
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-container-request-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './container-request-page.component.html',
  styleUrls: ['./container-request-page.component.scss']
})
export class ContainerRequestPageComponent {
  dataService = inject(DataServiceService);

  getApprovedString(approved:boolean) : string{
    if(approved){
      return 'JA';
    }
    return 'NEIN';
  }
}
