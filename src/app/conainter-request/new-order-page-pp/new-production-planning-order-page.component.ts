import { ChangeDetectorRef, Component, computed, inject, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArticleCRDto, AddCsinquiryDto, AddOrderDto, AddTlinquiryDto, ChecklistDto, ChecklistsService, OrdersService, AddChecklistDto, StepsService, AddStepDto, ArticlesCRService, ProductionPlanningsService, AddArticlePPDto, ArticlesPPService } from '../../shared/swagger';
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
    this.editService.navigationPath = '/new-production-planning-page';
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      articles: this.fb.array([])
    });

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

  orderId = signal(1);
  customerName = signal('Customer');
  createdBy = signal('CreatedBy');
  status = signal('Status');
  additonalInformation = signal('');

  areArticlesValid = signal<boolean>(true);

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

  isAllValid = computed(() => {
    return (
      this.areArticlesValid()
    );
  });

  setAreArticlesValid() {
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
      inquiryForFixedOrder: [''],
      inquiryForQuotation: ['']
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

  saveOrder(): void {
    console.log('posted clicked');

    this.productionPlanningService.productionPlanningsPost()
      .subscribe(productionPlanningObj => {
        console.log(productionPlanningObj);
        for (let i = 0; i < this.articlesFormArray.length; i++) {
          let article: AddArticlePPDto = {
            articleNumber: this.getFormGroup(i).get('articleNumber')!.value,
            productionPlanningId: productionPlanningObj.id,
            pallets: 1
          };

          this.articlesPPService.articlesPPPost(article).subscribe(x => {
            console.log('article posted: ' + x.id);
            console.log(x);
          }
          );
        }
        let order: AddOrderDto;

        if (this.additonalInformation() === '') {
          order = {
            customerName: this.customerName(),
            status: this.status(),
            createdBy: this.createdBy(),
            amount: 1,
            ppId: productionPlanningObj.id,
          };
        } else {
          order = {
            customerName: this.customerName(),
            status: this.status(),
            createdBy: this.createdBy(),
            amount: 1,
            ppId: productionPlanningObj.id,
            additionalInformation: this.additonalInformation()
          };
        }

        console.log('order');
        console.log(order);

        this.orderService.ordersPost(order)
          .subscribe(x => {
            this.orderId.set(x.id);
            this.editService.navigateToPath();
          });
      });
  }
}