import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { DataServiceService } from '../shared/data-service.service';
import { OrderDto } from '../shared/swagger';

@Component({
  selector: 'app-container-request-page',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTableModule],
  templateUrl: './container-request-page.component.html',
  styleUrls: ['./container-request-page.component.scss']
})
export class ContainerRequestPageComponent implements OnInit {
  ngOnInit(): void {
    this.allOrders.set(this.dataService.allOrders());
  }
  dataService = inject(DataServiceService);
  allOrders = signal<OrderDto[]>([]);
}
