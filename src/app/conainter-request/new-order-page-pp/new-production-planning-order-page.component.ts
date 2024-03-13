import { ChangeDetectorRef, Component, computed, inject, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddOrderDto, ChecklistsService, OrdersService, ProductionPlanningsService, AddArticlePPDto, ArticlesPPService, ProductionPlanningDto, AddProductionPlanningDto } from '../../shared/swagger';
import { NgSignalDirective } from '../../shared/ngSignal.directive';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ValidationService } from '../../shared/validation.service';
import { EditService } from '../../edit.service';

@Component({
  selector: 'app-new-order-page',
  standalone: true,
  imports: [CommonModule, NgSignalDirective, TranslocoModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-production-planning-order-page.component.html',
  styleUrl: './new-production-planning-order-page.component.scss'
})
export class NewProductionPlanningOrderPageComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.editService.navigationPath = '/container-request-page/productionPlanningCS';
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });

    this.editService.navigationPath = '/container-request-page/productionPlanningCS';
    this.addArticle();
  }

  editService = inject(EditService);
  myForm!: FormGroup;
  dataService: any;
  fb = inject(FormBuilder);
  orderService = inject(OrdersService);
  validationService = inject(ValidationService);
  checklistService = inject(ChecklistsService);
  articlesPPService = inject(ArticlesPPService);
  productionPlanningService = inject(ProductionPlanningsService);
  cdr = inject(ChangeDetectorRef);

  customerPriority = signal('');
  recievingCountry = signal('');
  areArticlesValid = signal<boolean>(true);
  isCustomerValid = computed(() => this.validationService.isAnyInputValid(this.editService.customerName()));
  isCreatedByValid = computed(() => this.validationService.isNameStringValid(this.editService.createdByCS()));
  isCustomerPriortityValid = computed(() => this.customerPriority().length === 1);
  isRecievingCountryValid = computed(() => this.validationService.isAnyInputValid(this.recievingCountry()));
  isAllValid = computed(() => {
    return (
      this.isCustomerValid() &&
      this.isCreatedByValid() &&
      this.isCustomerPriortityValid() &&
      this.isRecievingCountryValid() &&
      this.areArticlesValid()
    );
  });

  setAreArticleNumbersValid() {
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (this.getFormGroup(i).get('articleNumber')!.value < 1) {
        this.areArticlesValid.set(false);
        return;
      }

      if (this.getFormGroup(i).get('palletAmount')!.value < 1) {
        this.areArticlesValid.set(false);
        return;
      }
    }
    this.areArticlesValid.set(true);
  }

  setAreArticlesValid() {
    console.log(this.getFormGroup(0).get('desiredDeliveryDate')!.value);
    console.log(!this.validationService.isDateValid(this.getFormGroup(0).get('desiredDeliveryDate')!.value));
    for (let i = 0; i < this.articlesFormArray.length; i++) {
      if (!(this.getFormGroup(i).get('minHeigthRequired')!.value > 0) || !this.validationService.isDateValid(this.getFormGroup(i).get('desiredDeliveryDate')!.value)) {
        this.areArticlesValid.set(false);
        return;
      }
    }
    this.areArticlesValid.set(true);
  }

  get articlesFormArray() {
    return this.myForm.get('articles') as FormArray;
  }

  addArticle() {
    const articleGroup = this.fb.group({
      articleNumber: [1, Validators.required],
      palletAmount: [1, Validators.required],
      minHeigthRequired: [1, Validators.required],
      desiredDeliveryDate: [''],
      inquiryForFixedOrder: [false],
      inquiryForQuotation: [false]
    });

    this.articlesFormArray.push(articleGroup);
    this.setAreArticlesValid();
  }

  getFormGroup(index: number): FormGroup {
    return this.articlesFormArray.at(index) as FormGroup;
  }

  removeArticle(index: number) {
    this.articlesFormArray.removeAt(index);
    this.setAreArticleNumbersValid();
  }

  saveOrder(): void {
    console.log('posted clicked');
    let prodcutionPlanningDto: AddProductionPlanningDto = {
      customerPriority: this.customerPriority(),
      recievingCountry: this.recievingCountry()
    }

    this.productionPlanningService.productionPlanningsPost(prodcutionPlanningDto)
      .subscribe(productionPlanningObj => {
        console.log(productionPlanningObj);
        for (let i = 0; i < this.articlesFormArray.length; i++) {

          let article: AddArticlePPDto = {
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            productionPlanningId: productionPlanningObj.id,
            pallets: this.getFormGroup(i).get('palletAmount')!.value,
            minHeigthRequired: this.getFormGroup(i).get('minHeigthRequired')!.value,
            inquiryForFixedOrder: this.getFormGroup(i).get('inquiryForFixedOrder')!.value,
            inquiryForQuotation: this.getFormGroup(i).get('inquiryForQuotation')!.value,
            desiredDeliveryDate: this.getFormGroup(i).get('desiredDeliveryDate')!.value
          };
          console.log('all articles: ');
          console.log(article);

          this.articlesPPService.articlesPPPost(article).subscribe(x => {
            console.log('article posted: ' + x.id);
            console.log(x);
          }
          );
        }
        let order: AddOrderDto;

        if (this.editService.additonalInformation() === '') {
          order = {
            customerName: this.editService.customerName(),
            createdBy: this.editService.createdByCS(),
            ppId: productionPlanningObj.id,
          };
        } else {
          order = {
            customerName: this.editService.customerName(),
            createdBy: this.editService.createdByCS(),
            ppId: productionPlanningObj.id,
            additionalInformation: this.editService.additonalInformation()
          };
        }

        console.log('order');
        console.log(order);

        this.orderService.ordersPost(order)
          .subscribe(x => {
            console.log('ORDER POSTED');
            this.editService.navigateToPath();
          } );
      });
  }
}