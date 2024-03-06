import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticleCRDto, ArticlesCRService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditApproveDto, EditCsinquiryDto, EditOrderDto, OrderDto, OrdersService, TlinquiriesService } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../shared/validation.service';
import { EditService } from '../../edit.service';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-cs-container-request-order-page.component.html',
  styleUrl: './edit-cs-container-request-order-page.component.scss'
})
export class EditCsContainerRequestOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  articlesCRService = inject(ArticlesCRService);
  validationService = inject(ValidationService);
  router = inject(Router);
  fb = inject(FormBuilder);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  csinquiriesService = inject(CsinquiriesService);
  editService = inject(EditService);
  tlinquiryService = inject(TlinquiriesService);

  myForm!: FormGroup;
  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      amount: 1,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      ppId: 1,
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
      loadingPlattform: 'Loading',
      approvedByCrCs: false,
      approvedByCrCsTime: "",
      isDirectLine: false,
      isFastLine: false
    });

  //OrderData
  isApprovedByCs = signal(false);
  isApprovedByTl = signal(false);
  fastLine = signal(false);
  directLine = signal(false);

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
  isCustomerValid = computed(() => this.validationService.isAnyInputValid(this.editService.customerName()));
  isCreatedByValid = computed(() => this.validationService.isNameStringValid(this.editService.createdBy()));
  isAbNumberValid = computed(() => this.validationService.isNumberValid(this.abnumber()));
  isGrossWeightInKgValid = computed(() => this.validationService.isNumberValid(this.grossWeightInKg()));
  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.editService.status()));
  isAmountValid = computed(() => this.validationService.isNumberValid(this.editService.amount()));
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
    this.editService.navigationPath = '/container-request-page/containerRequestCS';

    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => this.allChecklists.set(x));

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        this.currOrder.set(x);
        this.setOrderSignals();

        this.articlesCRService.articlesCRCsInquiryIdGet(this.currOrder().csid)
          .subscribe(x => x.forEach(x => this.addArticle(x.articleNumber, x.pallets, x.id)));

        this.csinquiriesService.csinquiriesIdGet(this.currOrder().csid)
          .subscribe(x => {
            this.currCsInquiry.set(x);
            this.setCsInquirySignals();
          });

        this.tlinquiryService.tlinquiriesIdGet(this.currOrder().tlid)
          .subscribe(x => this.isApprovedByTl.set(x.approvedByCrTl));
      });
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, id: number) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      palletAmount: [palletAmount, Validators.required],
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
    this.articlesCRService.articlesCRDelete(articleId).subscribe(x => console.log('article deleted: ' + articleId));
    this.articlesFormArray.removeAt(index);
  }

  saveArticles() {
    const articles = this.myForm.value.articles;
    console.log('Entered Articles:', articles);
  }

  setAreArticleNumbersValid(index: number, btnName: string) {
    if (index >= 0) {
      console.log('inside the if1');
      if (!!this.getFormGroup(index).get('directline')!.value && !!this.getFormGroup(index).get('fastline')!.value) {
        if (btnName === "directline") {
          this.getFormGroup(index).get('fastline')!.setValue(false);
        } else if (btnName === "fastline") {
          this.getFormGroup(index).get('directline')!.setValue(false);
        }
      }
    }

    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (this.getFormGroup(i).get('articleNumber')!.value < 1) {
        this.areArticleNumbersValid.set(false);
        return;
      }

      if ((this.getFormGroup(i).get('directline')!.value === true || this.getFormGroup(i).get('fastline')!.value === true) && this.getFormGroup(i).get('palletAmount')!.value < 1) {
        this.areArticleNumbersValid.set(false);
        return;
      }
    }
    this.areArticleNumbersValid.set(true);
  }

  prepareSaveOrder() {
    const order: EditOrderDto = {
      customerName: this.editService.customerName(),
      status: this.editService.status(),
      createdBy: this.editService.createdBy(),
      amount: this.editService.amount(),
      checklistId: this.editService.checklistId(),
      id: this.id,
      additionalInformation: this.editService.additonalInformation() === '' ? null : this.editService.additonalInformation()
    };

    return order;
  }

  saveOrder(): void {
    let order = this.prepareSaveOrder();

    this.orderService.ordersPut(order)
      .subscribe(x => {
        this.saveCsInquery();
        this.saveArticlesToDB();
        this.editService.navigateToPath();
      });
  }

  publish() {
    let order = this.prepareSaveOrder();

    this.orderService.ordersPut(order)
      .subscribe(x => {
        this.saveCsInquery();
        this.saveArticlesToDB();
        let editOrder: EditApproveDto = {
          id: this.currOrder().csid,
          approve: true
        };


        this.csinquiriesService.csinquiriesApproveCrCsPut(editOrder)
          .subscribe(x =>  this.editService.navigateToPath());
      });
  }

  saveArticlesToDB() {
    this.articlesCRService.articlesCRCsIdDelete(this.currCsInquiry().id)
      .subscribe(x => {
        for (let i = 0; i < this.articlesFormArray.length; i++) {

          let article: AddArticleCRDto = {
            pallets: this.getFormGroup(i).get('palletAmount')!.value,
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            csInquiryId: this.currCsInquiry().id
          };

          this.articlesCRService.articlesCRPost(article).subscribe(x =>
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
      loadingPlattform: this.loadingPlattform(),
      isDirectLine: this.fastLine(),
      isFastLine: this.directLine()
    }

    this.csinquiriesService.csinquiriesPut(editedCsInquery)
      .subscribe(x => console.log('RETURN VALUE OF CSINQUERY SAVE: ' + x.id + x.abnumber + x.freeDetention + x.readyToLoad));
  }

  setOrderSignals() {
    this.editService.setOrderSignals(this.currOrder());
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
    this.fastLine.set(this.currCsInquiry().isFastLine);
    this.directLine.set(this.currCsInquiry().isDirectLine);
    this.isApprovedByCs.set(this.currCsInquiry().approvedByCrCs);
  }
}