import { Injectable, inject, signal } from '@angular/core';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import { Router } from '@angular/router';
import { OrderDto, EditApproveDto, ChecklistsService, OrdersService } from './shared/swagger';

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
  createdBy = signal('');
  status = signal('');
  amount = signal(0);
  checklistId = signal(0);
  isApprovedByPpPp = signal(false);
  additonalInformation = signal('');
  navigationPath = '';

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
    this.createdBy.set(currOrder.createdBy);
    this.status.set(currOrder.status);
    this.amount.set(currOrder.amount);
    this.checklistId.set(currOrder.checklistId);
    let additonalInformation = currOrder.additionalInformation
    if (additonalInformation != null && additonalInformation != undefined) {
      this.additonalInformation.set(additonalInformation);
    }
  }

  createEditOrder(id: number): EditApproveDto {
    let editOrder: EditApproveDto = {
      id: id,
      approve: true
    };
    return editOrder;
  }
}

