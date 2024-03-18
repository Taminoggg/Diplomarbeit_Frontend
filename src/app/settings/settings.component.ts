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

  orderDtoPropertyNamesNotInTableHeaders = signal<string[]>([]);
  approvedMapping = '';

  setPropertiesNotInTableHeaders() {
    console.log("🚀 ~ SettingsComponent ~ setPropertiesNotInTableHeaders ~ setPropertiesNotInTableHeaders:")
    let orderDto: OrderDto = {
      id: 1,
      successfullyFinished: false,
      canceled: false,
      status: 'Test',
      customerName: 'Test',
      createdByCS: 'Test',
      createdBySD: 'Test',
      finishedOn: '',
      createdOn: '',
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      additionalInformation: '',
      ppId: 1
    };

    let propertiesToCheckPP: string[] = [];
    if (this.htmlContent === 'productionPlanningPP' || this.htmlContent === 'productionPlanningCS') {
      propertiesToCheckPP = ['articleNumbers', 'factory', 'plant'];
      console.log('propertiesToCheck', propertiesToCheckPP);
    }

    let propertiesToCheckCS: string[] = [];
    if (this.htmlContent === 'containerRequestTL' || this.htmlContent === 'containerRequestCS') {
      propertiesToCheckCS = ['sped', 'abNumber', 'readyToLoad', 'country'];
      console.log('propertiesToCheck', propertiesToCheckCS);
    }

    console.log('gettingFilteredProperties');
    const filteredProperties = Object.keys(orderDto).filter(key => {
      const value = key as keyof OrderDto;
      if (!value.toLowerCase().includes('time') && !value.toLowerCase().includes('id') && !value.toLowerCase().includes('canceled') && !value.toLowerCase().includes('successfullyfinished') && !value.toLowerCase().includes('additionalinformation') && !value.toLowerCase().includes('approved')) {
        console.log(value);
        return !this.dataService.tableHeaders.some(header => header.value === value);
      }
      return false;
    });

    this.orderDtoPropertyNamesNotInTableHeaders.set(filteredProperties);

    propertiesToCheckCS.forEach(prop => {
      if (!this.dataService.tableHeaders.some(header => header.value === prop)) {
        this.orderDtoPropertyNamesNotInTableHeaders().push(prop);
      }
    });

    propertiesToCheckPP.forEach(prop => {
      if (!this.dataService.tableHeaders.some(header => header.value === prop)) {
        this.orderDtoPropertyNamesNotInTableHeaders().push(prop);
      }
    });
  }

  valueMapping: { [key: string]: string } = {
    'abNumber': 'ab-nr',
    'readyToLoad': 'ready-to-load',
    'customerName': 'customer',
    'createdByCS': 'created-by',
    'createdBySD': 'edited-by',
    'status': 'status',
    'lastUpdated': 'last-updated',
    'sped': 'sped',
    'amount': 'amount',
    'country': 'country',
    'finishedOn': 'finished-on',
    'createdOn': 'created-on',
    'plant': 'plant',
    'factory': 'factory',
    'articleNumbers': 'article-numbers'
  };

  add(nameNotInTableHeader: string) {
    const newItem = { label: this.valueMapping[nameNotInTableHeader], value: nameNotInTableHeader as keyof OrderDto | 'readyToLoad' | 'sped' | 'abNumber' | 'country' | "articleNumbers" | "factory" | "plant" | "assignment" | "create" | "chat" };
    this.dataService.tableHeaders.push(newItem);
    this.setPropertiesNotInTableHeaders();
  }

  remove(index: number) {
    this.dataService.tableHeaders.splice(index, 1);
    this.setPropertiesNotInTableHeaders();
  }
}
