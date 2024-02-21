import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditApproveOrderDto, EditArticleDto, EditOrderDto, EditPPArticleDto, EditTlInqueryDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ValidationService } from '../../shared/validation.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-pp-production-planning-order-page.component.html',
  styleUrl: './edit-pp-production-planning-order-page.component.scss'
})
export class EditPPProductionPlanningOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  articlesService = inject(ArticlesService);
  fb = inject(FormBuilder);
  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  tlinquiriesService = inject(TlinquiriesService);
  csinquiriesService = inject(CsinquiriesService);
  validationService = inject(ValidationService);

  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      approvedByCrCs: false,
      approvedByCrTl: false,
      approvedByPpCs: false,
      approvedByCsTime: '',
      approvedByTlTime: '',
      approvedByPpCsTime: '',
      amount: 0,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      readyToLoad: 'Test',
      abNumber: 1,
      country: 'Test',
      sped: 'Test',
      additionalInformation: ''
    });
  allChecklists = signal<ChecklistDto[]>([]);
  currCsInquiry = signal<CsinquiryDto>({
    id: 0,
    container: '',
    abnumber: 0,
    grossWeightInKg: 0,
    incoterm: '',
    containersizeA: 0,
    containersizeB: 0,
    containersizeHc: 0,
    freeDetention: false,
    thctb: false,
    readyToLoad: '',
    loadingPlattform: ''
  });
  currTlInquiry = signal<TlinquiryDto>(
    {
      id: 1,
      inquiryNumber: 1,
      sped: 'Loading',
      country: 'Loading',
      acceptingPort: 'Loading',
      expectedRetrieveWeek: '17.12.2023',
      weightInKg: 1,
      invoiceOn: '17.12.2023',
      retrieveDate: '17.12.2023',
      isContainer40: false,
      isContainerHc: false,
      retrieveLocation: 'Loading',
      debtCapitalGeneralForerunEur: 1,
      debtCapitalMainDol: 1,
      debtCapitalTrailingDol: 1,
      portOfDeparture: 'Loading',
      ets: '17.12.2023',
      eta: '17.12.2023',
      boat: 'Loading'
    });

  //OrderData
  csId = signal(0);
  tlId = signal(0);
  customerName = signal('');
  createdBy = signal('');
  status = signal('');
  amount = signal(0);
  checklistId = signal(0);
  isApprovedByCs = signal(false);
  isApprovedByTl = signal(false);
  currChecklistname = signal('');
  additonalInformation = signal('');

  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.status()));

  myForm!: FormGroup;

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checklistService.checklistsGet()
      .subscribe(x => {
        this.allChecklists.set(x);
      });

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        if (x !== null && x !== undefined) {
          this.currOrder.set(x);
          console.log(this.currOrder());
          this.setOrderSignals();

          this.articlesService.articlesCsInquiryIdGet(this.currOrder().csid)
            .subscribe(x => x.forEach(x => {
              if (x.minHeigthRequired !== 0 && x.desiredDeliveryDate !== null) {
                this.addArticle(x.articleNumber, x.pallets, x.isDirectLine, x.isFastLine, x.id, x.minHeigthRequired, x.desiredDeliveryDate, x.inquiryForFixedOrder, x.inquiryForQuotation, x.deliveryDate, x.shortText, x.factory, x.nozzle, x.productionOrder, x.plannedOrder, x.plant);
              } else {
                console.log('null');
                this.addArticle(x.articleNumber, x.pallets, x.isDirectLine, x.isFastLine, x.id, 1, '', false, false, '', '', '', '', '', '', '');
              }
            }));

          this.checklistService.checklistsIdGet(this.currOrder().checklistId)
            .subscribe(x => {
              if (x.checklistname !== null && x.checklistname !== undefined) {
                this.currChecklistname.set(x.checklistname);
              }
            });
        }
      });
  }

  isAllValid = computed(() => true);

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, directLine: boolean, fastLine: boolean, id: number, minHeigthRequired: number, desiredDeliveryDate: string, inquiryForFixedOrder: boolean, inquiryForQuotation: boolean, deliveryDate: string, shortText: string, factory: string, nozzle: string, productionOrder: string, plannedOrder: string, plant: string) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      palletAmount: [palletAmount, Validators.required],
      directLine: [directLine],
      fastLine: [fastLine],
      id: [id],
      minHeigthRequired: [minHeigthRequired],
      desiredDeliveryDate: [desiredDeliveryDate],
      inquiryForFixedOrder: [inquiryForFixedOrder],
      inquiryForQuotation: [inquiryForQuotation],
      deliveryDate: [deliveryDate],
      shortText: [shortText],
      factory: [factory],
      nozzle: [nozzle],
      productionOrder: [productionOrder],
      plannedOrder: [plannedOrder],
      plant: [plant]
    });

    this.articlesFormArray.push(articleGroup);
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  saveArticles() {
    const articles = this.myForm.value.articles;
    console.log('Entered Articles:', articles);
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
    console.log(this.articlesFormArray.length);
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      console.log(this.getFormGroup(i).get('plant')!.value);
      let article: EditPPArticleDto = {
        id: this.getFormGroup(i).get('id')!.value,
        deliveryDate: this.getFormGroup(i).get('deliveryDate')!.value,
        plannedOrder: this.getFormGroup(i).get('plannedOrder')!.value,
        productionOrder: this.getFormGroup(i).get('productionOrder')!.value,
        shortText: this.getFormGroup(i).get('shortText')!.value,
        factory: this.getFormGroup(i).get('factory')!.value,
        nozzle: this.getFormGroup(i).get('nozzle')!.value,
        plant: this.getFormGroup(i).get('plant')!.value,
      };

      console.log('edited articles: ');
      if (i + 1 !== this.articlesFormArray.length) {
        this.articlesService.articlesProductionPlanningPut(article).subscribe(x => console.log(x));
      } else {
        this.articlesService.articlesProductionPlanningPut(article).subscribe(x => this.navigateToOverview());
      }
    }
  }

  publish() {
    let editOrder: EditApproveOrderDto = {
      id: this.currOrder().id,
      approve: true
    };

    this.orderService.ordersApprovedByPpCsPut(editOrder)
      .subscribe(x => this.saveOrder());
  }

  navigateToOverview(): void {
    this.router.navigateByUrl('/container-request-page/productionPlanningPP');
  }

  setOrderSignals(): void {
    this.csId.set(this.currOrder().csid);
    this.tlId.set(this.currOrder().tlid);
    this.customerName.set(this.currOrder().customerName);
    this.createdBy.set(this.currOrder().createdBy);
    this.status.set(this.currOrder().status);
    this.amount.set(this.currOrder().amount);
    this.checklistId.set(this.currOrder().checklistId);
    this.isApprovedByCs.set(this.currOrder().approvedByCrCs);
    this.isApprovedByTl.set(this.currOrder().approvedByCrTl);
    let additonalInformation = this.currOrder().additionalInformation
    if (additonalInformation != null && additonalInformation != undefined) {
      this.additonalInformation.set(additonalInformation);
    }
  }
}
