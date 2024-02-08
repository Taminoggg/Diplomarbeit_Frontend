import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticleDto, ArticleDto, ArticlesService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditApproveOrderDto, EditCsinquiryDto, EditOrderDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../validation.service';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-cs-container-request-order-page.component.html',
  styleUrl: './edit-cs-container-request-order-page.component.scss'
})
export class EditCsContainerRequestOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  articlesService = inject(ArticlesService);
  validationService = inject(ValidationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csinquiriesService = inject(CsinquiriesService);

  myForm!: FormGroup;
  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      approvedByCs: false,
      approvedByTl: false,
      amount: 1,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      sped: 'Test',
      country: 'Test',
      abNumber: 1,
      readyToLoad: 'Test',
      additionalInformation: ''
    });

  allChecklists = signal<ChecklistDto[]>([]);
  currCsInquiry = signal<CsinquiryDto>(
    {
      id: 1,
      container: 'Loading',
      abnumber: 1,
      grossWeightInKg: 1,
      incoterm: 'Loading',
      containersizeA: 1,
      containersizeB: 1,
      containersizeHc: 1,
      freeDetention: false,
      thctb: false,
      readyToLoad: '01.01.1999',
      loadingPlattform: 'Loading'
    });

  //OrderData
  csId = signal(0);
  customerName = signal('');
  createdBy = signal('');
  status = signal('');
  amount = signal(0);
  checklistId = signal(0);
  isApprovedByCs = signal(false);
  isApprovedByTl = signal(false);
  additonalInformation = signal('');

  //CsData
  container = signal('');
  abnumber = signal(0);
  grossWeightInKg = signal(0);
  incoterm = signal('');
  containersizeA = signal(0);
  containersizeB = signal(0);
  containersizeHc = signal(0);
  freeDetention = signal(false);
  thctb = signal(false);
  readyToLoad = signal('');
  loadingPlattform = signal('');

  areArticleNumbersValid = signal<boolean>(true);
  isReadyToLoadValid = computed(() => this.validationService.isDateValid(this.readyToLoad()));
  isLoadingPlattfromValid = computed(() => this.validationService.isAnyInputValid(this.loadingPlattform()));
  isCustomerValid = computed(() => this.validationService.isAnyInputValid(this.customerName()));
  isCreatedByValid = computed(() => this.validationService.isNameStringValid(this.createdBy()));
  isAbNumberValid = computed(() => this.validationService.isNumberValid(this.abnumber()));
  isGrossWeightInKgValid = computed(() => this.validationService.isNumberValid(this.grossWeightInKg()));
  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.status()));
  isAmountValid = computed(() => this.validationService.isNumberValid(this.amount()));
  isContainerSizeAValid = computed(() => this.validationService.isNumberValid(this.containersizeA()));
  isContainerSizeBValid = computed(() => this.validationService.isNumberValid(this.containersizeB()));
  isContainerSizeHcValid = computed(() => this.validationService.isNumberValid(this.containersizeHc()));
  isIncotermValid = computed(() => this.validationService.isAnyInputValid(this.incoterm()));
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

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checklistService.checklistsGet()
      .subscribe(x => this.allChecklists.set(x));

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        this.currOrder.set(x);
        this.setOrderSignals();

        this.articlesService.articlesCsInquiryIdGet(this.currOrder().csid)
          .subscribe(x => x.forEach(x => this.addArticle(x.articleNumber, x.pallets, x.isDirectLine, x.isFastLine, x.id)));

        this.csinquiriesService.csinquiriesIdGet(this.currOrder().csid)
          .subscribe(x => {
            this.currCsInquiry.set(x);
            this.setCsInquirySignals();
          });
      });
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, directLine: boolean, fastLine: boolean, id: number) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      palletAmount: [palletAmount, Validators.required],
      directline: [directLine],
      fastLine: [fastLine],
      id: [id]
    });

    this.articlesFormArray.push(articleGroup);
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  removeArticle(index: number) {
    const articleFormGroup = this.getFormGroup(index);
    const articleId = articleFormGroup.get('id')?.value;
    this.articlesService.articlesDelete(articleId).subscribe(x => console.log('article deleted: ' + articleId));
    this.articlesFormArray.removeAt(index);
  }

  saveArticles() {
    const articles = this.myForm.value.articles;
    console.log('Entered Articles:', articles);
  }

  containerRequestPage(): void {
    this.router.navigateByUrl('/container-request-page/containerRequestCS');
  }

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

  generatePDF() {
    const data = document.getElementById('contentToConvert');
    if (data) {
      html2canvas(data).then((canvas) => {
        const imgWidth = 208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jspdf('p', 'mm', 'a4');

        pdf.addImage(contentDataURL, 'PNG', 1, 0, imgWidth, imgHeight);
        pdf.save('myPDF.pdf');
      });
    } else {
      console.error("Element with ID 'contentToConvert' not found.");
    }
  }

  saveOrder(): void {
    console.log(this.additonalInformation());

    let order: EditOrderDto;
    if (this.additonalInformation() === '') {
      console.log(1);
       order = {
        customerName: this.customerName(),
        status: this.status(),
        createdBy: this.createdBy(),
        amount: this.amount(),
        checklistId: this.checklistId(),
        id: this.id,
        approvedByTl: this.isApprovedByTl(),
        approvedByCs: this.isApprovedByCs()
      };
    }else{
      console.log(2);
      order = {
        customerName: this.customerName(),
        status: this.status(),
        createdBy: this.createdBy(),
        amount: this.amount(),
        checklistId: this.checklistId(),
        id: this.id,
        approvedByTl: this.isApprovedByTl(),
        approvedByCs: this.isApprovedByCs(),
        additionalInformation: this.additonalInformation()
      };
    }

    console.log(order);

    this.orderService.ordersPut(order)
      .subscribe(x => {
        this.saveCsInquery();
        this.saveArticlesToDB();
        this.containerRequestPage();
      });

  }

  saveArticlesToDB() {
    this.articlesService.articlesCsIdDelete(this.currCsInquiry().id)
      .subscribe(x => {
        for (let i = 0; i < this.articlesFormArray.length; i++) {

          let article: AddArticleDto = {
            isDirectLine: this.getFormGroup(i).get('directline')!.value,
            isFastLine: this.getFormGroup(i).get('fastLine')!.value,
            pallets: this.getFormGroup(i).get('palletAmount')!.value,
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            csInquiryId: this.currCsInquiry().id
          };

          this.articlesService.articlesPost(article).subscribe(x =>
            console.log('article posted: ' + x.id)
          );
        }
      });
  }

  saveCsInquery() {
    let editedCsInquery: EditCsinquiryDto = {
      id: this.currCsInquiry().id,
      container: this.container(),
      abnumber: this.abnumber(),
      grossWeightInKg: this.grossWeightInKg(),
      incoterm: this.incoterm(),
      containersizeA: this.containersizeA(),
      containersizeB: this.containersizeB(),
      containersizeHc: this.containersizeHc(),
      freeDetention: this.freeDetention(),
      thctb: this.thctb(),
      readyToLoad: this.readyToLoad(),
      loadingPlattform: this.loadingPlattform()
    }

    this.csinquiriesService.csinquiriesPut(editedCsInquery)
      .subscribe(x => console.log('RETURN VALUE OF CSINQUERY SAVE: ' + x.id + x.abnumber + x.freeDetention + x.readyToLoad));
  }

  publish() {
    let editOrder: EditApproveOrderDto = {
      id: this.currOrder().id,
      approve: true
    };

    this.orderService.ordersApprovedByCsPut(editOrder)
      .subscribe(x => console.log('approved'));

    this.saveOrder();
  }

  setOrderSignals() {
    this.csId.set(this.currOrder().csid);
    this.customerName.set(this.currOrder().customerName);
    this.createdBy.set(this.currOrder().createdBy);
    this.status.set(this.currOrder().status);
    this.amount.set(this.currOrder().amount);
    this.checklistId.set(this.currOrder().checklistId);
    this.isApprovedByCs.set(this.currOrder().approvedByCs);
    this.isApprovedByTl.set(this.currOrder().approvedByTl);
    let additonalInformation = this.currOrder().additionalInformation
    if (additonalInformation != null && additonalInformation != undefined) {
      this.additonalInformation.set(additonalInformation);
    }
  }

  setCsInquirySignals() {
    this.container.set(this.currCsInquiry().container);
    this.abnumber.set(this.currCsInquiry().abnumber);
    this.grossWeightInKg.set(this.currCsInquiry().grossWeightInKg);
    this.incoterm.set(this.currCsInquiry().incoterm);
    this.containersizeA.set(this.currCsInquiry().containersizeA);
    this.containersizeB.set(this.currCsInquiry().containersizeB);
    this.containersizeHc.set(this.currCsInquiry().containersizeHc);
    this.freeDetention.set(this.currCsInquiry().freeDetention);
    this.thctb.set(this.currCsInquiry().thctb);
    this.readyToLoad.set(this.currCsInquiry().readyToLoad);
    this.loadingPlattform.set(this.currCsInquiry().loadingPlattform);
  }
}