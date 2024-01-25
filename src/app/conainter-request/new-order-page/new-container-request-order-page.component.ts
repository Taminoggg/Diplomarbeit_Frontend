import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCsinquiryDto, AddOrderDto, AddTlinquiryDto, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';



@Component({
  selector: 'app-new-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-container-request-order-page.component.html',
  styleUrl: './new-container-request-order-page.component.scss'
})
export class NewContainerOrderPageComponent implements OnInit {
  dataService: any;
  ngOnInit(): void {
    this.checklistService.checklistsGet()
      .subscribe(x => this.allCheckliststs.set(x));

    this.myForm = this.fb.group({
      articleNumbers: this.fb.array([])
    });
  }

  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csInquiryService = inject(CsinquiriesService);
  tlInquiryService = inject(TlinquiriesService);

  allCheckliststs = signal<ChecklistDto[]>([]);

  csId = signal(1);
  tlId = signal(1);
  customerName = signal('');
  createdBy = signal('');
  status = signal(1);
  amount = signal(1);
  checklistId = signal(1);
  userText = signal('');

  myForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  get articleNumbersFormArray() {
    return this.myForm.get('articleNumbers') as FormArray;
  }

  addArticleNumber() {
    this.articleNumbersFormArray.push(this.fb.control(null, Validators.required));
  }

  removeArticleNumber(index: number) {
    this.articleNumbersFormArray.removeAt(index);
  }

  saveArticleNumbers() {
    const articleNumbers = this.myForm.value.articleNumbers;
    console.log('Entered Article Numbers:', articleNumbers);
    // You can save the article numbers to your desired location or perform any other action here
  }

  articleAmount = [0];
  articleNumbers = signal<number[]>([]);
  articleDirectLines = signal<boolean[]>([]);
  articlePallets = signal<number[]>([]);

  //CsData
  container = signal('Test');
  fastLine = signal('Test');
  directLine = signal('Test');
  customer = signal('Test');
  abnumber = signal(0);
  bruttoWeightInKg = signal(1);
  incoterm = signal('Test');
  containersizeA = signal(1);
  containersizeB = signal(1);
  containersizeHc = signal(1);
  freeDetention = signal(false);
  thctb = signal(false);
  readyToLoad = signal('17.12.2023');
  loadingPlattform = signal('Test');

  containerRequestPage(): void {
    this.router.navigateByUrl('/container-request-page');
  }

  addOrder(): void {
    let csInquiry: AddCsinquiryDto = {
      container: this.container(),
      fastLine: this.fastLine(),
      directLine: this.directLine(),
      articleNumber: '1',//this.articleNumber()
      palletamount: 1,//this.palletamount()
      customer: this.customer(),
      abnumber: this.abnumber(),
      bruttoWeightInKg: this.bruttoWeightInKg(),
      incoterm: this.incoterm(),
      containersizeA: this.containersizeA(),
      containersizeB: this.containersizeB(),
      containersizeHc: this.containersizeHc(),
      freeDetention: this.freeDetention(),
      thctb: this.thctb(),
      readyToLoad: this.readyToLoad(),
      loadingPlattform: this.loadingPlattform()
    };

    let tlInquiry: AddTlinquiryDto = {
      inquiryNumber: 1,
      sped: 'TODO',
      country: 'TODO',
      acceptingPort: 'TODO',
      expectedRetrieveWeek: '17.12.2023',
      weightInKg: 1,
      invoiceOn: '17.12.2023',
      retrieveDate: '17.12.2023',
      isContainer40: false,
      isContainerHc: false,
      retrieveLocation: 'TODO',
      debtCapitalGeneralForerunEur: 1,
      debtCapitalMainDol: 1,
      debtCapitalTrailingDol: 1,
      portOfDeparture: 'TODO',
      ets: '17.12.2023',
      eta: '17.12.2023',
      boat: 'TODO'
    };

    console.log(tlInquiry);

    this.csInquiryService.csinquiriesPost(csInquiry)
      .subscribe(csInquiryObj => {
        this.tlInquiryService.tlinquiriesPost(tlInquiry)
          .subscribe(tlInquiryObj => {
            let order: AddOrderDto = {
              customerName: this.customerName(),
              status: this.status(),
              createdBy: this.createdBy(),
              amount: this.amount(),
              checklistId: this.checklistId(),
              csid: csInquiryObj.id,
              tlid: tlInquiryObj.id
            };

            this.orderService.ordersPost(order)
              .subscribe(x => console.log(x));
          });
      });

    this.router.navigateByUrl('/shippment-request-page');
  }
}
