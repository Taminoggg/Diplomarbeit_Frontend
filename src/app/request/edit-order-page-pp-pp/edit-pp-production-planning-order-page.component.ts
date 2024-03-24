import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesPPService, ChecklistDto, ChecklistsService, EditOrderSDDto, EditPpPpArticleDto, OrderDto, OrdersService, ProductionPlanningsService } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { TranslocoModule } from '@ngneat/transloco';
import { ValidationService } from '../../shared/validation.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditService } from '../../shared/edit.service';

@Component({
  selector: 'app-edit-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-pp-production-planning-order-page.component.html',
  styleUrl: './edit-pp-production-planning-order-page.component.scss'
})
export class EditPPProductionPlanningOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

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
          this.editService.currOrder.set(x);
          this.editService.setOrderSignals(this.editService.currOrder());

          this.articlesPPService.articlesPPProductionPlanningIdGet(this.editService.currOrder().ppId)
            .subscribe(x => {
              x.forEach(x => {
                let deliveryDate = x.deliveryDate;
                if(deliveryDate === -1){
                  deliveryDate = 0;
                }
                this.addArticle(x.articleNumber, x.pallets, x.id, x.minHeigthRequired, x.desiredDeliveryDate, x.inquiryForFixedOrder, x.inquiryForNonFixedOrder, x.inquiryForQuotation, deliveryDate, x.shortText, x.factory, x.nozzle, x.productionOrder, x.plannedOrder, x.plant);
                this.setAreArticlesValid();
              });
            });

          this.productionPlanningService.productionPlanningsIdGet(this.editService.currOrder().ppId)
            .subscribe(x => {
              this.customerPriority.set(x.customerPriority);
              this.recievingCountry.set(x.recievingCountry);
              this.isApprovedByPpPp.set(x.approvedByPpPp);
            });
        }
      });
  }

  articlesPPService = inject(ArticlesPPService);
  fb = inject(FormBuilder);
  editService = inject(EditService);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  productionPlanningService = inject(ProductionPlanningsService);
  prodcutionPlanningService = inject(ProductionPlanningsService);
  validationService = inject(ValidationService);
  allChecklists = signal<ChecklistDto[]>([]);

  recievingCountry = signal('');
  customerPriority = signal('');
  isApprovedByPpPp = signal(false);
  areArticlesValid = signal<boolean>(true);
  isCreatedBySDValid = computed(() => this.validationService.isNameStringValid(this.editService.createdBySD()));
  isAllValid = computed(() => this.isCreatedBySDValid() && this.areArticlesValid() && !this.isApprovedByPpPp());
  myForm!: FormGroup;

  setAreArticlesValid() {
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (!this.validationService.isCalenderWeekValid(this.getFormGroup(i).get('deliveryDate')!.value) || !this.validationService.isStringLengthOkay(this.getFormGroup(i).get('shortText')!.value) || !this.validationService.isStringLengthOkay(this.getFormGroup(i).get('factory')!.value) || !this.validationService.isStringLengthOkay(this.getFormGroup(i).get('plant')!.value) || !this.validationService.isStringLengthOkay(this.getFormGroup(i).get('nozzle')!.value) || !this.validationService.isStringLengthOkay(this.getFormGroup(i).get('productionOrder')!.value) || !this.validationService.isStringLengthOkay(this.getFormGroup(i).get('plannedOrder')!.value)) {
        this.areArticlesValid.set(false);
        return;
      }
    }
    this.areArticlesValid.set(true);
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle(articleNumber: number, palletAmount: number, id: number, minHeigthRequired: number, desiredDeliveryDate: number, inquiryForFixedOrder: boolean, inquiryForNonFixedOrder: boolean,  inquiryForQuotation: boolean, deliveryDate: number, shortText: string, factory: string, nozzle: string, productionOrder: string, plannedOrder: string, plant: string) {
    const articleGroup = this.fb.group({
      articleNumber: [articleNumber],
      palletAmount: [palletAmount],
      id: id,
      minHeigthRequired: [minHeigthRequired],
      desiredDeliveryDate: [desiredDeliveryDate],
      inquiryForFixedOrder: [{ value: inquiryForFixedOrder, disabled: true }],
      inquiryForNonFixedOrder: [{ value: inquiryForNonFixedOrder, disabled: true }],
      inquiryForQuotation: [{ value: inquiryForQuotation, disabled: true }],
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

  saveOrder(){
    this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('pp-in-progress'))
      .subscribe(_ => this.saveArticles());
  }

  saveArticles(): void {
    let editOrderSDDto: EditOrderSDDto = {
      id: this.editService.currOrder().id,
      additionalInformation: this.editService.additonalInformation(),
      createdBy: this.editService.createdBySD()
    }

    this.orderService.ordersOrderSDPut(editOrderSDDto)
      .subscribe(x => x);

    console.log('saving order');
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      let article: EditPpPpArticleDto = {
        id: this.getFormGroup(i).get('id')!.value,
        deliveryDate: this.getFormGroup(i).get('deliveryDate')!.value,
        plannedOrder: this.getFormGroup(i).get('plannedOrder')?.value ?? null,
        productionOrder: this.getFormGroup(i).get('productionOrder')?.value ?? null,
        shortText: this.getFormGroup(i).get('shortText')?.value ?? null,
        factory: this.getFormGroup(i).get('factory')?.value ?? null,
        nozzle: this.getFormGroup(i).get('nozzle')?.value ?? null,
        plant: this.getFormGroup(i).get('plant')?.value ?? null,
      };

      console.log('edited articles: ');
      if (i + 1 !== this.articlesFormArray.length) {
        this.articlesPPService.articlesPPPut(article).subscribe(x => console.log(x));
      } else {
        this.articlesPPService.articlesPPPut(article).subscribe(x => this.editService.navigateToPath());
      }
    }
  }

  publish() {
    this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('edited-by-pp'))
      .subscribe(_ => _);

    this.prodcutionPlanningService.productionPlanningsApprovePpPpPut(this.editService.createEditStatusDto(this.editService.currOrder().ppId, true))
      .subscribe(x => this.saveArticles());
  }
}
