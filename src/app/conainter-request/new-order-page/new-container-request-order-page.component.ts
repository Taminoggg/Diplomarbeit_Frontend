import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticleDto, AddCsinquiryDto, AddOrderDto, AddTlinquiryDto, ArticlesService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
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
  ngOnInit(): void {
    this.checklistService.checklistsGet()
      .subscribe(x => this.allCheckliststs.set(x));

    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });

    this.addArticle();
  }

  myForm!: FormGroup;
  dataService: any;
  router = inject(Router);
  fb = inject(FormBuilder);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csInquiryService = inject(CsinquiriesService);
  articlesService = inject(ArticlesService);
  tlInquiryService = inject(TlinquiriesService);
  cdr = inject(ChangeDetectorRef);

  allCheckliststs = signal<ChecklistDto[]>([]);
  csId = signal(1);
  tlId = signal(1);
  customerName = signal('Customer');
  createdBy = signal('CreatedBy');
  status = signal(1);
  amount = signal(1);
  checklistId = signal(1);
  userText = signal('');

  //CsData
  container = signal('Test');
  abnumber = signal(1);
  grossWeightInKg = signal(1);
  incoterm = signal('Test');
  containersizeA = signal(1);
  containersizeB = signal(1);
  containersizeHc = signal(1);
  freeDetention = signal(false);
  thctb = signal(false);
  readyToLoad = signal('17.12.2023');
  loadingPlattform = signal('Test');

  simpleDatePattern = /^(?<day>[0-2]\d|3[0-1])\.(?<month>0\d|1[0-2])\.(?<year>\d{4})$/gm;
  isReadyToLoadValid = computed(() => {
    let result = this.readyToLoad().match(this.simpleDatePattern);
    return result !== null && result.length > 0;
  });


  isLoadingPlattfromValid = computed(() => {
    return this.loadingPlattform().length > 0;
  });

  isCustomerValid = computed(() => {
    return this.customerName().length > 0;
  });

  simpleStringPattern = /^[A-Z\d-,][a-zA-Z\d-,]*(?:\s\w+)*$/gm;
  isCreatedByValid = computed(() => {
    let result = this.createdBy().match(this.simpleStringPattern);
    return result !== null && result.length > 0;
  });

  simpleNumberPattern = /^[1-9]\d*$/gm;
  isAbNumberValid = computed(() => {
    let result = this.abnumber().toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  });

  areArticleNumbersValid = signal<boolean>(false);

  setAreArticleNumbersValid() {
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (this.getFormGroup(i).get('articleNumber')!.value < 1) {
        this.areArticleNumbersValid.set(false);
        return;
      }

      if (this.getFormGroup(i).get('directline')!.value === true && this.getFormGroup(i).get('palletAmount')!.value < 1) {
        this.areArticleNumbersValid.set(false);
        return;
      }
    }
    this.areArticleNumbersValid.set(true);
  }

  isGrossWeightInKgValid = computed(() => {
    let result = this.grossWeightInKg().toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  });

  isStatusValid = computed(() => {
    let result = this.status().toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  });

  isAmountValid = computed(() => {
    let result = this.amount().toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  });

  isContainerSizeAValid = computed(() => {
    let result = this.containersizeA().toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  });

  isContainerSizeBValid = computed(() => {
    let result = this.containersizeB().toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  });

  isContainerSizeHcValid = computed(() => {
    let result = this.containersizeHc().toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  });

  isAllValid = computed(() => {
    return (
      this.isReadyToLoadValid() &&
      this.isCustomerValid() &&
      this.isLoadingPlattfromValid() &&
      this.isCreatedByValid() &&
      this.isAbNumberValid() &&
      this.isGrossWeightInKgValid() &&
      this.isStatusValid() &&
      this.isAmountValid() &&
      this.isContainerSizeAValid() &&
      this.isContainerSizeBValid() &&
      this.isContainerSizeHcValid() && 
      this.areArticleNumbersValid()
    );
  });

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle() {
    const articleGroup = this.fb.group({
      articleNumber: [-1, Validators.required],
      palletAmount: [1, Validators.required],
      directline: [false],
      fastLine: [false]
    });

    this.articlesFormArray.push(articleGroup);
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  removeArticle(index: number) {
    this.articlesFormArray.removeAt(index);
    this.setAreArticleNumbersValid();
  }

  saveArticles() {
    const articles = this.myForm.value.articles;
    console.log('Entered Articles:', articles);
  }

  containerRequestPage(): void {
    this.router.navigateByUrl('/container-request-page');
  }

  addOrder(): void {
    console.log('posted clicked');

    let csInquiry: AddCsinquiryDto = {
      container: this.container(),
      abnumber: this.abnumber(),
      bruttoWeightInKg: this.grossWeightInKg(),
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
      sped: 'Sped',
      country: 'Country',
      acceptingPort: 'AcceptingPort',
      expectedRetrieveWeek: '17.12.2023',
      weightInKg: 1,
      invoiceOn: '17.12.2023',
      retrieveDate: '17.12.2023',
      isContainer40: false,
      isContainerHc: false,
      retrieveLocation: 'RetrieveLocation',
      debtCapitalGeneralForerunEur: 1,
      debtCapitalMainDol: 1,
      debtCapitalTrailingDol: 1,
      portOfDeparture: 'PortOfDeparture',
      ets: '17.12.2023',
      eta: '17.12.2023',
      boat: 'Boat'
    };

    console.log(tlInquiry);

    this.csInquiryService.csinquiriesPost(csInquiry)
      .subscribe(csInquiryObj => {
        for (let i = 0; i < this.articlesFormArray.length; i++) {

          let article: AddArticleDto = {
            isDirectLine: this.getFormGroup(i).get('directline')!.value,
            isFastLine: this.getFormGroup(i).get('fastLine')!.value,
            pallets: this.getFormGroup(i).get('palletAmount')!.value,
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            csInquiryId: csInquiryObj.id
          };

          this.articlesService.articlesPost(article).subscribe(x =>
            console.log('article posted: ' + x.id)
          );
        }

        console.log('posting tlInquiry');

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

            console.log('Posting order');

            this.orderService.ordersPost(order)
              .subscribe(x => console.log(x));
          });
      });

    this.router.navigateByUrl('/container-request-page');
  }
}