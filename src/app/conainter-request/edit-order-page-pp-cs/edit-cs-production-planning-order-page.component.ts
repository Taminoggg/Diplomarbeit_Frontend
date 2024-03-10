import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticlePPDto, ArticlesPPService, ChecklistDto, ChecklistsService, EditOrderDto, EditPpPpArticleDto, OrderDto, OrdersService, ProductionPlanningsService } from '../../shared/swagger';
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
  productionPlanningService = inject(ProductionPlanningsService);
  allChecklists = signal<ChecklistDto[]>([]);

  //OrderData
  isApprovedByPpCs = signal(false);
  isApprovedByPpPp = signal(false);

  areArticlesValid = signal<boolean>(true);
  isStatusValid = computed(() => this.validationService.isAnyInputValid(this.editService.status()));
  isAllValid = computed(() =>
    this.isStatusValid() &&
    this.areArticlesValid() &&
    !this.editService.currOrder().successfullyFinished &&
    !this.editService.currOrder().canceled
  );

  myForm!: FormGroup;

  setAreArticlesValid() {
    console.log(this.getFormGroup(0).get('minHeigthRequired')!.value);

    for (let i = 0; i < this.articlesFormArray.length; i++) {
      console.log(this.getFormGroup(i).get('desiredDeliveryDate')!.value);
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

  cancelOrder() {
    this.orderService.ordersCancelPut(this.editService.createEditStatusDto(this.editService.currOrder().id, true))
      .subscribe(x => this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('order-canceled'))
        .subscribe(_ => this.editService.navigateToPath()));
  }

  finishOrder() {
    this.orderService.ordersSuccessfullyFinishedPut(this.editService.createEditStatusDto(this.editService.currOrder().id, true))
      .subscribe(x => this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('order-finished'))
        .subscribe(_ => this.editService.navigateToPath()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editService.navigationPath = '/container-request-page/productionPlanningCS';

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        if (x !== null && x !== undefined) {
          this.editService.currOrder.set(x);

          this.setOrderSignals();
          this.articlesPPService.articlesPPProductionPlanningIdGet(this.editService.currOrder().ppId)
            .subscribe(x => console.log(x));

          this.articlesPPService.articlesPPProductionPlanningIdGet(this.editService.currOrder().ppId)
            .subscribe(x => x.forEach(x => {
              if (x.minHeigthRequired !== 0 && x.desiredDeliveryDate !== null) {
                this.addArticle(x.articleNumber, x.pallets, x.id, x.minHeigthRequired, x.desiredDeliveryDate, x.inquiryForFixedOrder, x.inquiryForQuotation, x.deliveryDate, x.shortText, x.factory, x.nozzle, x.productionOrder, x.plannedOrder, x.plant);
              } else {
                console.log('null');
                this.addArticle(1, 1, 1, 1, '', false, false, '', '', '', '', '', '', '');
              }
            }));

          this.setProductionPlanningSignal();
        }
      });
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, id: number, minHeigthRequired: number, desiredDeliveryDate: string, inquiryForFixedOrder: boolean, inquiryForQuotation: boolean, deliveryDate: string, shortText: string, factory: string, nozzle: string, productionOrder: string, plannedOrder: string, plant: string) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      palletAmount: [palletAmount, Validators.required],
      id: id,
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

  removeArticle(index: number) {
    const articleFormGroup = this.getFormGroup(index);
    const articleId = articleFormGroup.get('id')?.value;
    this.articlesPPService.articlesPPDelete(articleId).subscribe(x => console.log('article deleted: ' + articleId));
    this.articlesFormArray.removeAt(index);
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  saveArticles() {
    const articles = this.myForm.value.articles;
    console.log('Entered Articles:', articles);
  }

  saveOrder(): void {
    this.articlesPPService.articlesPPProductionPlanningIdDelete(this.editService.currOrder().ppId)
      .subscribe(x => {
        for (let i = 0; i < this.articlesFormArray.length; i++) {
          let article: AddArticlePPDto = {
            productionPlanningId: this.editService.currOrder().ppId,
            minHeigthRequired: this.getFormGroup(i).get('minHeigthRequired')!.value,
            desiredDeliveryDate: this.getFormGroup(i).get('desiredDeliveryDate')!.value,
            inquiryForFixedOrder: this.getFormGroup(i).get('inquiryForFixedOrder')!.value,
            inquiryForQuotation: this.getFormGroup(i).get('inquiryForQuotation')!.value,
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            pallets: this.getFormGroup(i).get('palletAmount')!.value,
          };

          console.log('all artilces:');
          console.log(article);

          console.log('trying to edited articles: ');
          if (i + 1 !== this.articlesFormArray.length) {
            this.articlesPPService.articlesPPPost(article).subscribe(postedArticle => {

              let editArticle: EditPpPpArticleDto = {
                deliveryDate: this.getFormGroup(i).get('deliveryDate')?.value ?? '',
                id: postedArticle.id,
                shortText: this.getFormGroup(i).get('shortText')?.value ?? '',
                nozzle: this.getFormGroup(i).get('nozzle')?.value ?? '',
                factory: this.getFormGroup(i).get('factory')?.value ?? '',
                plannedOrder: this.getFormGroup(i).get('plannedOrder')?.value ?? '',
                productionOrder: this.getFormGroup(i).get('productionOrder')?.value ?? '',
                plant: this.getFormGroup(i).get('plant')?.value ?? '',
              }

              if (
                editArticle.deliveryDate !== '' &&
                editArticle.shortText !== '' &&
                editArticle.nozzle !== '' &&
                editArticle.factory !== '' &&
                editArticle.plannedOrder !== '' &&
                editArticle.productionOrder !== '' &&
                editArticle.plant !== ''
              ) {
                this.articlesPPService.articlesPPPut(editArticle)
                  .subscribe(_ => _);
              }
            });
          } else {
            this.articlesPPService.articlesPPPost(article).subscribe(postedArticle => {
              let editArticle: EditPpPpArticleDto = {
                deliveryDate: this.getFormGroup(i).get('deliveryDate')?.value ?? '',
                id: postedArticle.id,
                shortText: this.getFormGroup(i).get('shortText')?.value ?? '',
                nozzle: this.getFormGroup(i).get('nozzle')?.value ?? '',
                factory: this.getFormGroup(i).get('factory')?.value ?? '',
                plannedOrder: this.getFormGroup(i).get('plannedOrder')?.value ?? '',
                productionOrder: this.getFormGroup(i).get('productionOrder')?.value ?? '',
                plant: this.getFormGroup(i).get('plant')?.value ?? '',
              }

              console.log('editArticle');
              console.log(editArticle);

              if (
                editArticle.deliveryDate !== '' &&
                editArticle.shortText !== '' &&
                editArticle.nozzle !== '' &&
                editArticle.factory !== '' &&
                editArticle.plannedOrder !== '' &&
                editArticle.productionOrder !== '' &&
                editArticle.plant !== ''
              ) {
                this.articlesPPService.articlesPPPut(editArticle)
                  .subscribe(_ => this.editService.navigateToPath());
              } else {
                this.editService.navigateToPath();
              }
            });
          }
        }
      });

    let editOrderDto: EditOrderDto = {
      id: this.editService.currOrder().id,
      customerName: this.editService.customerName(),
      createdBy: this.editService.createdBy(),
      additionalInformation: this.editService.additonalInformation()
    }

    this.orderService.ordersPut(editOrderDto)
      .subscribe(_ => _);
  }

  publish() {
    this.productionPlanningService.productionPlanningsApprovePpCsPut(this.editService.createEditStatusDto(this.editService.currOrder().ppId, true))
      .subscribe(x => this.saveOrder());

    this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('sent-to-pp'))
      .subscribe(_ => _);

    if (this.isApprovedByPpPp()) {
      this.productionPlanningService.productionPlanningsApprovePpPpPut(this.editService.createEditStatusDto(this.editService.currOrder().ppId, false))
        .subscribe(_ => _);
    }
  }

  setOrderSignals(): void {
    this.editService.setOrderSignals(this.editService.currOrder());
  }

  setProductionPlanningSignal() {
    this.productionPlanningService.productionPlanningsIdGet(this.editService.currOrder().ppId)
      .subscribe(x => {
        this.isApprovedByPpCs.set(x.approvedByPpCs);
        this.isApprovedByPpPp.set(x.approvedByPpPp);
      });
  }
}
