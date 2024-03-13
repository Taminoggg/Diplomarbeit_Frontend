import { Injectable, inject, signal } from '@angular/core';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import { Router } from '@angular/router';
import { OrderDto, ChecklistsService, OrdersService, EditStatusDto, EditOrderStatusDto } from './shared/swagger';

@Injectable({
  providedIn: 'root'
})
export class EditService {
  router = inject(Router);
  checklistService = inject(ChecklistsService);
  orderService = inject(OrdersService);

  csId = signal(0);
  tlId = signal(0);
  customerName = signal('');
  createdByCS = signal('');
  createdBySD = signal('');
  status = signal('');
  checklistId = signal(0);
  isApprovedByPpPp = signal(false);
  additonalInformation = signal('');
  createdOn = signal('');
  finishedOn = signal('');
  navigationPath = '';
  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdByCS: 'Test',
      createdBySD: 'Test',
      successfullyFinished: false,
      canceled: false,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      ppId: 1,
      readyToLoad: 'Test',
      abNumber: 1,
      country: 'Test',
      sped: 'Test',
      additionalInformation: '',
      createdOn: '',
      finishedOn: ''
    });

  navigateToPath(): void {
    this.router.navigateByUrl(this.navigationPath);
  }

  generatePDFFromContent() {
    const data = document.getElementById('contentToConvert');
    if (data) {
      html2canvas(data).then((canvas) => {
        const imgWidth = 208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jspdf('l', 'mm', 'a5');

        pdf.addImage(contentDataURL, 'PNG', 1, 0, imgWidth, imgHeight);
        pdf.save('myPDF.pdf');
      });
    } else {
      console.error("Element with ID 'contentToConvert' not found.");
    }
  }

  setOrderSignals(currOrder: OrderDto): void {
    this.csId.set(currOrder.csid);
    this.tlId.set(currOrder.tlid);
    this.customerName.set(currOrder.customerName);
    this.createdByCS.set(currOrder.createdByCS);
    this.createdBySD.set(currOrder.createdBySD);
    this.status.set(currOrder.status);
    this.createdOn.set(currOrder.createdOn);
    this.finishedOn.set(currOrder.finishedOn);
    this.checklistId.set(currOrder.checklistId);
    let additonalInformation = currOrder.additionalInformation
    if (additonalInformation != null && additonalInformation != undefined) {
      this.additonalInformation.set(additonalInformation);
    }
    console.log('orderID:');
    console.log(this.currOrder().id);
  }

  createEditStatusDto(id:number, status:boolean): EditStatusDto {
    let editOrder: EditStatusDto = {
      id: id,
      status: status
    };
    return editOrder;
  }

  createEditOrderStatusDto(status:string): EditOrderStatusDto {
    let editOrder: EditOrderStatusDto = {
      id: this.currOrder().id,
      status: status
    };
    return editOrder;
  }
}

