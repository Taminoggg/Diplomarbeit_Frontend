import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticlePPDto, AddOrderDto, AddProductionPlanningDto, ArticlesPPService, ChecklistDto, ChecklistsService, EditOrderCSDto, EditPpPpArticleDto, EditProductionPlanningDto, OrderDto, OrdersService, ProductionPlanningsService } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { ValidationService } from '../../shared/validation.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditService } from '../../shared/edit.service';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-or-add-cs-production-planning-order-page.component.html',
  styleUrl: './edit-or-add-cs-production-planning-order-page.component.scss'
})
export class EditOrAddCsProductionPlanningOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;
  @Input() actionType = '';

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });

    if (this.actionType === 'new') {
      this.addArticle(1, 1, 1, 1, 1, 1, '', '', '', '', '', '', 3);
    }
    this.setAreArticlesValid();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editService.navigationPath = '/container-request-page/productionPlanningCS';

    if (this.actionType === 'edit') {
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
                  let selectedInquiry = 3;
                  if (x.inquiryForNonFixedOrder === true) {
                    selectedInquiry = 1;
                  } else if (x.inquiryForQuotation === true) {
                    selectedInquiry = 2;
                  } else if (x.inquiryForFixedOrder === true) {
                    selectedInquiry = 0;
                  } 

                  this.addArticle(x.articleNumber, x.pallets, x.id, x.minHeigthRequired, x.desiredDeliveryDate, x.deliveryDate, x.shortText, x.factory, x.nozzle, x.productionOrder, x.plannedOrder, x.plant, selectedInquiry);
                }
              }));

            this.setProductionPlanningSignal();
          }
        });
    }
  }

  articlesPPService = inject(ArticlesPPService);
  fb = inject(FormBuilder);
  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  validationService = inject(ValidationService);
  editService = inject(EditService);
  productionPlanningService = inject(ProductionPlanningsService);
  allChecklists = signal<ChecklistDto[]>([]);

  customerPriority = signal('');
  recievingCountry = signal('');
  isApprovedByPpCs = signal(false);
  isApprovedByPpPp = signal(false);
  myForm!: FormGroup;
  areArticlesValid = signal<boolean>(true);
  isCustomerPriortityValid = computed(() => this.customerPriority().length === 1);
  isRecievingCountryValid = computed(() => this.validationService.isAnyInputValid(this.recievingCountry()));
  isCustomerValid = computed(() => this.validationService.isAnyInputValid(this.editService.customerName()));
  isCreatedByValid = computed(() => this.validationService.isNameStringValid(this.editService.createdByCS()));
  isAllValid = computed(() =>
    this.isCustomerValid() &&
    this.isRecievingCountryValid() &&
    this.isCustomerPriortityValid() &&
    this.isCreatedByValid() &&
    this.areArticlesValid() &&
    !this.editService.currOrder().successfullyFinished &&
    !this.editService.currOrder().canceled
  );

  setAreArticlesValid() {
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      console.log(this.getFormGroup(i).get('desiredDeliveryDate')!.value);
      if (!(this.getFormGroup(i).get('palletAmount')!.value > 0) || !(this.getFormGroup(i).get('selectedInquiry')!.value !== 3) || !(this.getFormGroup(i).get('minHeigthRequired')!.value > 0) || !this.validationService.isCalenderWeekValid(this.getFormGroup(i).get('desiredDeliveryDate')!.value)) {
        this.areArticlesValid.set(false);
        return;
      }
    }
    this.areArticlesValid.set(true);
  }

  removeArticle(index: number) {
    this.articlesFormArray.removeAt(index);
    this.setAreArticlesValid();
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

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, id: number, minHeigthRequired: number, desiredDeliveryDate: number, deliveryDate: number, shortText: string, factory: string, nozzle: string, productionOrder: string, plannedOrder: string, plant: string, selectedInquiry: number) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber, Validators.required],
      palletAmount: [palletAmount, Validators.required],
      id: id,
      minHeigthRequired: [minHeigthRequired],
      desiredDeliveryDate: [desiredDeliveryDate],
      selectedInquiry: [selectedInquiry],
      deliveryDate: [deliveryDate],
      shortText: [shortText],
      factory: [factory],
      nozzle: [nozzle],
      productionOrder: [productionOrder],
      plannedOrder: [plannedOrder],
      plant: [plant]
    });

    this.articlesFormArray.push(articleGroup);
    this.setAreArticlesValid();
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  postAndPublish() {
    this.saveNewOrder().then(() => {
      this.publishOrder();
    }).catch(error => {
      console.error('Error saving new order:', error);
    });
  }

  saveOrderWithoutPublish(){
    this.saveNewOrder().then(() => {
      this.editService.navigateToPath();
    }).catch(error => {
      console.error('Error saving new order:', error);
    });
  }

  publishOrder() {
    this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('sent-to-pp'))
      .subscribe(x => x);

    if (this.isApprovedByPpCs()) {
      this.productionPlanningService.productionPlanningsApprovePpPpPut(this.editService.createEditStatusDto(this.editService.currOrder().ppId, false))
        .subscribe(_ => _);
    }

    this.productionPlanningService.productionPlanningsApprovePpCsPut(this.editService.createEditStatusDto(this.editService.currOrder().ppId, true))
      .subscribe(x => this.editService.navigateToPath());
  }


  saveOrder(): void {
    let editProductionPlanning: EditProductionPlanningDto = {
      customerPriority: this.customerPriority(),
      recievingCountry: this.recievingCountry(),
      id: this.editService.currOrder().ppId
    }

    this.productionPlanningService.productionPlanningsPut(editProductionPlanning)
      .subscribe(_ => _);

    this.articlesPPService.articlesPPProductionPlanningIdDelete(this.editService.currOrder().ppId)
      .subscribe(x => {
        for (let i = 0; i < this.articlesFormArray.length; i++) {
          let inquiryForFixedOrder = false;
          let inquiryForNonFixedOrder = false;
          let inquiryForQuotation = false;
          if (this.getFormGroup(i).get('selectedInquiry')!.value === 0) {
            inquiryForFixedOrder = true;
          } else if (this.getFormGroup(i).get('selectedInquiry')!.value === 1) {
            inquiryForNonFixedOrder = true;
          } else if (this.getFormGroup(i).get('selectedInquiry')!.value === 2) {
            inquiryForQuotation = true;
          }

          let article: AddArticlePPDto = {
            productionPlanningId: this.editService.currOrder().ppId,
            minHeigthRequired: this.getFormGroup(i).get('minHeigthRequired')!.value,
            desiredDeliveryDate: this.getFormGroup(i).get('desiredDeliveryDate')!.value,
            inquiryForFixedOrder: inquiryForFixedOrder,
            inquiryForNonFixedOrder: inquiryForNonFixedOrder,
            inquiryForQuotation: inquiryForQuotation,
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            pallets: this.getFormGroup(i).get('palletAmount')!.value,
          };

          console.log('all artilces:');
          console.log(article);

          console.log('trying to edited articles: ');
          if (i + 1 !== this.articlesFormArray.length) {
            this.articlesPPService.articlesPPPost(article).subscribe(postedArticle => {

              let editArticle: EditPpPpArticleDto = {
                deliveryDate: this.getFormGroup(i).get('deliveryDate')?.value ?? 1,
                id: postedArticle.id,
                shortText: this.getFormGroup(i).get('shortText')?.value ?? '',
                nozzle: this.getFormGroup(i).get('nozzle')?.value ?? '',
                factory: this.getFormGroup(i).get('factory')?.value ?? '',
                plannedOrder: this.getFormGroup(i).get('plannedOrder')?.value ?? '',
                productionOrder: this.getFormGroup(i).get('productionOrder')?.value ?? '',
                plant: this.getFormGroup(i).get('plant')?.value ?? '',
              }

              if (
                editArticle.deliveryDate !== 0 &&
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
                editArticle.deliveryDate !== 0 &&
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

    let editOrderDto: EditOrderCSDto = {
      id: this.editService.currOrder().id,
      customerName: this.editService.customerName(),
      createdBy: this.editService.createdByCS(),
      additionalInformation: this.editService.additonalInformation()
    }

    this.orderService.ordersOrderCSPut(editOrderDto)
      .subscribe(_ => _);
  }

  saveNewOrder(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log('posted clicked');
      let prodcutionPlanningDto: AddProductionPlanningDto = {
        customerPriority: this.customerPriority(),
        recievingCountry: this.recievingCountry()
      }

      this.productionPlanningService.productionPlanningsPost(prodcutionPlanningDto)
        .subscribe(productionPlanningObj => {
          for (let i = 0; i < this.articlesFormArray.length; i++) {
            let inquiryForFixedOrder = false;
            let inquiryForNonFixedOrder = false;
            let inquiryForQuotation = false;
            if (this.getFormGroup(i).get('selectedInquiry')!.value === 0) {
              inquiryForFixedOrder = true;
            } else if (this.getFormGroup(i).get('selectedInquiry')!.value === 1) {
              inquiryForNonFixedOrder = true;
            } else if (this.getFormGroup(i).get('selectedInquiry')!.value === 2) {
              inquiryForQuotation = true;
            }

            let article: AddArticlePPDto = {
              articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
              productionPlanningId: productionPlanningObj.id,
              pallets: this.getFormGroup(i).get('palletAmount')!.value,
              minHeigthRequired: this.getFormGroup(i).get('minHeigthRequired')!.value,
              inquiryForFixedOrder: inquiryForFixedOrder,
              inquiryForNonFixedOrder: inquiryForNonFixedOrder,
              inquiryForQuotation: inquiryForQuotation,
              desiredDeliveryDate: this.getFormGroup(i).get('desiredDeliveryDate')!.value
            };

            this.articlesPPService.articlesPPPost(article).subscribe(x => console.log(x));
          }
          let order: AddOrderDto = {
            customerName: this.editService.customerName(),
            createdBy: this.editService.createdByCS(),
            ppId: productionPlanningObj.id,
          };
          
          const additionalInformation = this.editService.additonalInformation();
          if (additionalInformation !== '') {
            order.additionalInformation = additionalInformation;
          }

          this.orderService.ordersPost(order)
            .subscribe(x => {
              console.log('Order saved successfully');
              this.editService.currOrder.set(x)
              resolve();
            }, error => {
              console.error('Error saving order:', error);
              reject(error);
            });
        });
    });
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
        this.customerPriority.set(x.customerPriority);
        this.recievingCountry.set(x.recievingCountry);
        this.isApprovedByPpCs.set(x.approvedByPpCs);
        this.isApprovedByPpPp.set(x.approvedByPpPp);
      });
  }
}
