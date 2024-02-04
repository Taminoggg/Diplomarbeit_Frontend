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
export class ShippmentRequestComponent {
  
}