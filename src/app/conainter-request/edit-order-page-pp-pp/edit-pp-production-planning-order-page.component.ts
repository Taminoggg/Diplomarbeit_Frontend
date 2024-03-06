import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesPPService, ChecklistDto, ChecklistsService, EditPpPpArticleDto, OrderDto, OrdersService } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { TranslocoModule } from '@ngneat/transloco';
import { ValidationService } from '../../shared/validation.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditService } from '../../edit.service';
import { EditPPArticleDto } from '../../shared/swagger/model/editPPArticleDto';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-pp-production-planning-order-page.component.html',
  styleUrl: './edit-pp-production-planning-order-page.component.scss'
})
export class EditPPProductionPlanningOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  articlesPPService = inject(ArticlesPPService);
  fb = inject(FormBuilder);
  editService = inject(EditService);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  validationService = inject(ValidationService);

  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      amount: 0,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 1,
      tlid: 1,
      ppId: 1,
      readyToLoad: 'Test',
      abNumber: 1,
      country: 'Test',
      sped: 'Test',
      additionalInformation: ''
    });
  allChecklists = signal<ChecklistDto[]>([]);
  isApprovedByPpPp = signal(false);

  areArticlesValid = signal<boolean>(true);
  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.editService.status()));
  isAllValid = computed(() => this.isStatusValid() && this.areArticlesValid() && !this.isApprovedByPpPp());

  myForm!: FormGroup;

  setAreArticlesValid() {
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (!this.validationService.isAnyInputValid(this.getFormGroup(i).get('shortText')!.value) || !this.validationService.isDateValid(this.getFormGroup(i).get('deliveryDate')!.value) || !this.validationService.isAnyInputValid(this.getFormGroup(i).get('factory')!.value) || !this.validationService.isAnyInputValid(this.getFormGroup(i).get('nozzle')!.value) || !this.validationService.isAnyInputValid(this.getFormGroup(i).get('productionOrder')!.value) || !this.validationService.isAnyInputValid(this.getFormGroup(i).get('plannedOrder')!.value) || !this.validationService.isAnyInputValid(this.getFormGroup(i).get('plant')!.value)) {
        this.areArticlesValid.set(false);
        return;
      }
    }
    this.areArticlesValid.set(true);
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editService.navigationPath = '/container-request-page/productionPlanningPP';

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        if (x !== null && x !== undefined) {
          this.currOrder.set(x);
          console.log(this.currOrder());
          this.setOrderSignals();

          this.articlesPPService.articlesPPProductionPlanningIdGet(this.currOrder().ppId)
            .subscribe(x => x.forEach(x => {
              this.addArticle(x.articleNumber, x.pallets, x.isDirectLine, x.isFastLine, x.id, x.minHeigthRequired, x.desiredDeliveryDate, x.inquiryForFixedOrder, x.inquiryForQuotation, x.deliveryDate, x.shortText, x.factory, x.nozzle, x.productionOrder, x.plannedOrder, x.plant);
            }));
        }
      });
  }

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

  saveOrder(): void {
    console.log(this.articlesFormArray.length);
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      console.log(this.getFormGroup(i).get('plant')!.value);
      let article: EditPpPpArticleDto = {
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
        this.articlesPPService.articlesPPEditPpPpArticlePut(article).subscribe(x => console.log(x));
      } else {
        this.articlesPPService.articlesPPEditPpPpArticlePut(article).subscribe(x => this.editService.navigateToPath());
      }
    }
  }

  publish() {
    //this.orderService.ordersApprovedByPpPpPut(this.editService.createEditOrder(this.currOrder().id))
    //  .subscribe(x => this.saveOrder());
  }

  setOrderSignals(): void {
    this.editService.setOrderSignals(this.currOrder());
    console.log(this.currOrder());
    //this.isApprovedByPpPp.set(this.currOrder().approvedByPpPp);
  }
}
