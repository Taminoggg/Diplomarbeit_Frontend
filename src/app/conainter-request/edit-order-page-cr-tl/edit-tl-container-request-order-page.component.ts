import { Component, Input, inject, numberAttribute, signal, OnChanges, SimpleChanges, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesCRService, ChecklistDto, ChecklistsService, CsinquiriesService, CsinquiryDto, EditOrderCSDto, EditOrderSDDto, EditTlInqueryDto, OrderDto, OrdersService, TlinquiriesService, TlinquiryDto } from '../../shared/swagger';
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
  templateUrl: './edit-tl-container-request-order-page.component.html',
  styleUrl: './edit-tl-container-request-order-page.component.scss'
})
export class EditTlContainerRequestOrderPageComponent implements OnChanges, OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  ngOnInit(): void {
      this.myForm = this.fb.group({
        articles: this.fb.array([])
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editService.navigationPath = '/container-request-page/containerRequestTL';

    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => {
        this.allChecklists.set(x);
      });

    this.orderService.ordersIdGet(this.id)
      .subscribe(x => {
        if (x !== null && x !== undefined) {
          this.editService.currOrder.set(x);
          this.setOrderSignals();
          this.tlinquiriesService.tlinquiriesIdGet(this.editService.tlId())
            .subscribe(x => {
              if (x !== null && x !== undefined) {
                this.currTlInquiry.set(x);
                this.setTlInquirySignals();
                console.log('approved:' + this.currTlInquiry().approvedByCrTl);
              }
            });

          this.articlesCRService.articlesCRCsInquiryIdGet(this.editService.currOrder().csid)
            .subscribe(x => x.forEach(x => {
              this.addArticle(x.articleNumber, x.pallets, x.id);
              console.log('adding Article');
            }));

          this.csinquiriesService.csinquiriesIdGet(this.editService.csId())
            .subscribe(x => {
              if (x !== null && x !== undefined) {
                this.currCsInquiry.set(x);
                this.setCsInquirySignals();
              }
            });

          this.checklistService.checklistsIdGet(this.editService.currOrder().checklistId)
            .subscribe(x => {
              if (x.checklistname !== null && x.checklistname !== undefined) {
                this.currChecklistname.set(x.checklistname);
              }
            });
        }
      });
  }

  articlesCRService = inject(ArticlesCRService);
  fb = inject(FormBuilder);
  router = inject(Router);
  orderService = inject(OrdersService);
  checklistService = inject(ChecklistsService);
  tlinquiriesService = inject(TlinquiriesService);
  csinquiriesService = inject(CsinquiriesService);
  validationService = inject(ValidationService);
  editService = inject(EditService);

  allChecklists = signal<ChecklistDto[]>([]);
  currCsInquiry = signal<CsinquiryDto>({
    id: 0,
    country: '',
    abnumber: 0,
    grossWeightInKg: 0,
    incoterm: '',
    containersizeA: 0,
    containersizeB: 0,
    containersizeHc: 0,
    freeDetention: 0,
    thctb: false,
    thcc: false,
    readyToLoad: '',
    approvedByCrCs: false,
    approvedByCrCsTime: "",
    isFastLine: false,
    isDirectLine: false
  });
  currTlInquiry = signal<TlinquiryDto>(
    {
      id: 1,
      sped: 'Loading',
      acceptingPort: 'Loading',
      invoiceOn: '17.12.2023',
      retrieveDate: '17.12.2023',
      retrieveLocation: 'Loading',
      scGeneral: 1,
      scMain: 1,
      scTrail: 1,
      portOfDeparture: 'Loading',
      ets: '17.12.2023',
      eta: '17.12.2023',
      boat: 'Loading',
      approvedByCrTl: false,
      approvedByCrTlTime: ""
    });
  isApprovedByCs = signal(false);
  isApprovedByTl = signal(false);
  currChecklistname = signal('');
  abnumber = signal(0);
  grossWeightInKg = signal(0);
  incoterm = signal('');
  containersizeA = signal(0);
  containersizeB = signal(0);
  containersizeHc = signal(0);
  freeDetention = signal(0);
  thctb = signal(false);
  thcc = signal(false);
  readyToLoad = signal('');
  isFastLine = signal(false);
  isDirectLine = signal(false);
  sped = signal('');
  country = signal('');
  acceptingPort = signal('');
  invoiceOn = signal('');
  retrieveDate = signal('');
  retrieveLocation = signal('');
  scGeneral = signal(0);
  scMain = signal(0);
  scTrail = signal(0);
  portOfDeparture = signal('');
  ets = signal('');
  eta = signal('');
  boat = signal('');
  myForm!: FormGroup;
  isCreatedBySDValid = computed(() => this.validationService.isNameStringValid(this.editService.createdBySD()));
  isSpedValid = computed(() => this.validationService.isAnyInputValid(this.sped()));
  isAcceptingPortValid = computed(() => this.validationService.isAnyInputValid(this.acceptingPort()));
  isInvoiceOnValid = computed(() => this.validationService.isDateValid(this.invoiceOn()));
  isRetrieveDateValid = computed(() => this.validationService.isDateValid(this.retrieveDate()));
  isRetrieveLocationValid = computed(() => this.validationService.isAnyInputValid(this.retrieveLocation()));
  isSCGeneralValid = computed(() => this.validationService.isNumberWithCommaValid(this.scGeneral()));
  isSCMainValid = computed(() => this.validationService.isNumberWithCommaValid(this.scMain()));
  isSCTraiValid = computed(() => this.validationService.isNumberWithCommaValid(this.scTrail()));
  isPortOfDepartureValid = computed(() => this.validationService.isAnyInputValid(this.portOfDeparture()));
  isEtsValid = computed(() => this.validationService.isDateValid(this.ets()));
  isEtaValid = computed(() => this.validationService.isDateValid(this.eta()));
  isBoatValid = computed(() => this.validationService.isAnyInputValid(this.boat()));
  isAllValid = computed(() => {
    return (
      this.isCreatedBySDValid() &&
      this.isSpedValid() &&
      this.isAcceptingPortValid() &&
      this.isInvoiceOnValid() &&
      this.isRetrieveDateValid() &&
      this.isRetrieveLocationValid() &&
      this.isSCGeneralValid() &&
      this.isSCMainValid() &&
      this.isSCTraiValid() &&
      this.isPortOfDepartureValid() &&
      this.isEtsValid() &&
      this.isEtaValid() &&
      this.isBoatValid() &&
      !this.isApprovedByTl()
    );
  });

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

  saveArticles() {
    const articles = this.myForm.value.articles;
    console.log('Entered Articles:', articles);
  }

  prepareSaveOrder() {
    let editOrderSDDto: EditOrderSDDto = {
      id: this.editService.currOrder().id,
      additionalInformation: this.editService.additonalInformation(),
      createdBy: this.editService.createdBySD()
    }

    this.orderService.ordersOrderSDPut(editOrderSDDto)
      .subscribe(x => x);
  }

  saveOrder(): void {
    this.prepareSaveOrder();

    this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('tl-in-progress'))
      .subscribe(_ => _);
    this.saveTlInquery();
  }

  removeArticle(index: number) {
    this.articlesFormArray.removeAt(index);
  }

  saveTlInquery() {
    let editedTlInquiry: EditTlInqueryDto =
    {
      id: this.currTlInquiry().id,
      sped: this.sped(),
      acceptingPort: this.acceptingPort(),
      invoiceOn: this.invoiceOn(),
      retrieveDate: this.retrieveDate(),
      retrieveLocation: this.retrieveLocation(),
      scGeneral: this.scGeneral(),
      scMain: this.scMain(),
      scTrail: this.scTrail(),
      portOfDeparture: this.portOfDeparture(),
      ets: this.ets(),
      eta: this.eta(),
      boat: this.boat()
    }
    console.log(editedTlInquiry);

    this.tlinquiriesService.tlinquiriesPut(editedTlInquiry)
      .subscribe(_ => this.editService.navigateToPath());
  }

  publish() {
    this.prepareSaveOrder();

    this.orderService.ordersStatusPut(this.editService.createEditOrderStatusDto('edited-by-tl'))
      .subscribe(_ => _);
    this.saveTlInquery();
    this.tlinquiriesService.tlinquiriesApproveCrTlPut(this.editService.createEditStatusDto(this.editService.currOrder().tlid, true))
      .subscribe(x => this.editService.navigateToPath());
  }

  setOrderSignals(): void {
    this.editService.setOrderSignals(this.editService.currOrder());
  }

  setCsInquirySignals() {
    this.isFastLine.set(this.currCsInquiry().isFastLine);
    this.country.set(this.currCsInquiry().country);
    this.isDirectLine.set(this.currCsInquiry().isDirectLine);
    this.abnumber.set(this.currCsInquiry().abnumber);
    this.grossWeightInKg.set(this.currCsInquiry().grossWeightInKg);
    this.incoterm.set(this.currCsInquiry().incoterm);
    this.containersizeA.set(this.currCsInquiry().containersizeA);
    this.containersizeB.set(this.currCsInquiry().containersizeB);
    this.containersizeHc.set(this.currCsInquiry().containersizeHc);
    this.freeDetention.set(this.currCsInquiry().freeDetention);
    this.thctb.set(this.currCsInquiry().thctb);
    this.thcc.set(this.currCsInquiry().thcc);
    this.readyToLoad.set(this.currCsInquiry().readyToLoad);
  }

  setTlInquirySignals(): void {
    this.isApprovedByTl.set(this.currTlInquiry().approvedByCrTl);
    this.sped.set(this.currTlInquiry().sped);
    this.acceptingPort.set(this.currTlInquiry().acceptingPort);
    this.invoiceOn.set(this.currTlInquiry().invoiceOn);
    this.retrieveDate.set(this.currTlInquiry().retrieveDate);
    this.retrieveLocation.set(this.currTlInquiry().retrieveLocation);
    this.scGeneral.set(this.currTlInquiry().scGeneral);
    this.scMain.set(this.currTlInquiry().scMain);
    this.scTrail.set(this.currTlInquiry().scTrail);
    this.portOfDeparture.set(this.currTlInquiry().portOfDeparture);
    this.ets.set(this.currTlInquiry().ets);
    this.eta.set(this.currTlInquiry().eta);
    this.boat.set(this.currTlInquiry().boat);
  }
}
