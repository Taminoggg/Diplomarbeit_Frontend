import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { DataService } from '../shared/data.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { Router } from '@angular/router';
import { OrderDto } from '../shared/swagger';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, TranslocoModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  ngOnInit(): void {
    this.setPropertiesNotInTableHeaders();
  }

  @Input() htmlContent = "";
  dataService = inject(DataService);
  router = inject(Router);

  orderDtoPropertyNamesNotInTableHeaders = signal<string[]>([]);
  approvedMapping = '';

  moveItemUp(index: number) {
    if (index > 0) {
      const temp = this.dataService.tableHeaders[index];
      this.dataService.tableHeaders[index] = this.dataService.tableHeaders[index - 1];
      this.dataService.tableHeaders[index - 1] = temp;
    }
  }

  moveItemDown(index: number) {
    if (index < this.dataService.tableHeaders.length - 1) {
      const temp = this.dataService.tableHeaders[index];
      this.dataService.tableHeaders[index] = this.dataService.tableHeaders[index + 1];
      this.dataService.tableHeaders[index + 1] = temp;
    }
  }

  saveTableOrder() {
    localStorage.setItem(this.htmlContent + 'tableConfig', JSON.stringify(this.dataService.tableHeaders));
    this.containerRequestPage();
  }

  containerRequestPage(): void {
    this.router.navigateByUrl('/container-request-page/' + this.htmlContent);
  }

  setPropertiesNotInTableHeaders() {
    let orderDto: OrderDto = {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      amount: 1,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      sped: 'Test',
      country: 'Test',
      abNumber: 1,
      readyToLoad: 'Test',
      additionalInformation: '',
      ppId: 1
    };
  
    let propertiesToCheck:string[] = [];
    if (this.htmlContent === 'productionPlanningPP' || this.htmlContent === 'productionPlanningCS') {
      propertiesToCheck = ['articleNumbers', 'factory', 'plant'];
      console.log('propertiesToCheck', propertiesToCheck);
    }
  
    const filteredProperties = Object.keys(orderDto).filter(key => {
      const value = key as keyof OrderDto;

      if (!value.includes('Time') && !value.toLowerCase().includes('id') && !value.includes('additionalInformation') && !value.includes('approved')) {
        return !this.dataService.tableHeaders.some(header => header.value === value);
      }
      return false;
    });
  
    this.orderDtoPropertyNamesNotInTableHeaders.set(filteredProperties);

    propertiesToCheck.forEach(prop => {
      if (!this.dataService.tableHeaders.some(header => header.value === prop)) {
        this.orderDtoPropertyNamesNotInTableHeaders().push(prop);
      }
    });
  
    console.log('test', this.orderDtoPropertyNamesNotInTableHeaders());
  }
  


  valueMapping: { [key: string]: string } = {
    'abNumber': 'ab-nr',
    'readyToLoad': 'ready-to-load',
    'customerName': 'customer',
    'createdBy': 'created-by',
    'status': 'status',
    'lastUpdated': 'last-updated',
    'sped': 'sped',
    'amount': 'amount',
    'country': 'country',
    'plant': 'plant',
    'factory': 'factory',
    'articleNumbers': 'article-numbers'
  };

  add(nameNotInTableHeader: string) {
    const newItem = { label: this.valueMapping[nameNotInTableHeader], value: nameNotInTableHeader as keyof OrderDto | "articleNumbers" | "factory" | "plant" | "assignment" | "create" | "chat" };
    this.dataService.tableHeaders.push(newItem);
    this.setPropertiesNotInTableHeaders();
  }

  remove(index: number) {
    this.dataService.tableHeaders.splice(index, 1);
    this.setPropertiesNotInTableHeaders();
  }
}
