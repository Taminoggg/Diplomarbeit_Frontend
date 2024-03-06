import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesPPService, ChecklistDto, ChecklistsService, EditPpCrArticleDto, OrderDto, OrdersService } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ValidationService } from '../../shared/validation.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditService } from '../../edit.service';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-cs-production-planning-order-page.component.html',
  styleUrl: './edit-cs-production-planning-order-page.component.scss'
})
export class EditCsProductionPlanningOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  articlesPPService = inject(ArticlesPPService);
  fb = inject(FormBuilder);
  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  validationService = inject(ValidationService);
  editService = inject(EditService);

  currOrder = signal<OrderDto>(
    {
      id: 1,
      status: 'Test',
      customerName: 'Test',
      createdBy: 'Test',
      amount: 0,
      lastUpdated: 'Test',
      checklistId: 1,
      csid: 0,
      tlid: 0,
      ppId: 1,
      readyToLoad: 'Test',
      abNumber: 1,
      country: 'Test',
      sped: 'Test',
      additionalInformation: ''
    });
  allChecklists = signal<ChecklistDto[]>([]);

  //OrderData
  isApprovedByPpCs = signal(false);

  areArticlesValid = signal<boolean>(true);
  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.editService.status()));
  isAllValid = computed(() => this.isStatusValid() && this.areArticlesValid() && !this.isApprovedByPpCs());

  myForm!: FormGroup;

  setAreArticlesValid() {
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (!(this.getFormGroup(i).get('minHeigthRequired')!.value > 0) || !this.validationService.isDateValid(this.getFormGroup(i).get('desiredDeliveryDate')!.value)) {
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
    this.editService.navigationPath = '/container-request-page/productionPlanningCS';

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        if (x !== null && x !== undefined) {
          this.currOrder.set(x);
          
          this.setOrderSignals();
          console.log(this.currOrder());
          console.log('articlesForId');

          this.articlesPPService.articlesPPProductionPlanningIdGet(this.currOrder().ppId)
            .subscribe(x => x.forEach(x => {
              console.log('article:');
              console.log(x);
              if (x.minHeigthRequired !== 0 && x.desiredDeliveryDate !== null) {
                this.addArticle(x.articleNumber, x.id, x.minHeigthRequired, x.desiredDeliveryDate, x.inquiryForFixedOrder, x.inquiryForQuotation);
              } else {
                console.log('null');
                this.addArticle(x.articleNumber, x.id, 1, '', false, false);
              }
            }));
        }
      });
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, id: number, minHeigthRequired: number, desiredDeliveryDate: string, inquiryForFixedOrder: boolean, inquiryForQuotation: boolean) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      id: [id],
      minHeigthRequired: [minHeigthRequired],
      desiredDeliveryDate: [desiredDeliveryDate],
      inquiryForFixedOrder: [inquiryForFixedOrder],
      inquiryForQuotation: [inquiryForQuotation]
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
      let article: EditPpCrArticleDto = {
        id: this.getFormGroup(i).get('id')!.value,
        minHeigthRequired: this.getFormGroup(i).get('minHeigthRequired')!.value,
        desiredDeliveryDate: this.getFormGroup(i).get('desiredDeliveryDate')!.value,
        inquiryForFixedOrder: this.getFormGroup(i).get('inquiryForFixedOrder')!.value,
        inquiryForQuotation: this.getFormGroup(i).get('inquiryForQuotation')!.value,
        articleNumber: this.getFormGroup(i).get('articleNumber')!.value
      };

      console.log('edited articles: ');
      if (i + 1 !== this.articlesFormArray.length) {
        this.articlesPPService.articlesPPEditPpCrArticlePut(article).subscribe(x => console.log(x));
      } else {
        this.articlesPPService.articlesPPEditPpCrArticlePut(article).subscribe(x => this.editService.navigateToPath());
      }
    }
  }

  publish() {
    //this.orderService.ordersApprovedByPpCsPut(this.editService.createEditOrder(this.currOrder().id))
    //  .subscribe(x => this.saveOrder());
  }

  setOrderSignals(): void {
    this.editService.setOrderSignals(this.currOrder());
    //this.isApprovedByPpCs.set(this.currOrder().approvedByPpCs);
  }
}
