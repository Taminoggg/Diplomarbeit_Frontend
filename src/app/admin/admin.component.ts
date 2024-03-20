import { Component, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { AddChecklistDto, AddStepDto, ChecklistDto, ChecklistsService, CsinquiriesService, FilesService, MessageConversationsService, OrderDto, OrdersService, ProductionPlanningsService, StepDto, StepsService, TlinquiriesService } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';
import { TranslocoModule } from '@ngneat/transloco';
import { EditStepDto } from '../shared/swagger/model/editStepDto';
import { DataService } from '../shared/data.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgSignalDirective, TranslocoModule, MatIconModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  checklistService = inject(ChecklistsService);
  stepService = inject(StepsService);
  dataService = inject(DataService);
  tlinquiryService = inject(TlinquiriesService);
  csinquiryService = inject(CsinquiriesService);
  productionPlanningService = inject(ProductionPlanningsService);
  orderService = inject(OrdersService);

  selectedFilter = signal('CR');
  allChecklists = signal<ChecklistDto[]>([]);
  allStepsForChecklist = signal<StepDto[]>([]);
  selectedChecklistId = signal(-1);
  checklistName = signal('');
  selectedStepId = signal(-1);
  stepNumber = signal(1);
  stepName = signal('Name1');
  stepDescription = signal('Desc1');
  fromDate = signal('');
  toDate = signal('');
  filteredOrders = signal<OrderDto[]>([]);
  allOrders = signal<OrderDto[]>([]);
  messagesForOrder = new Map<number, number>();
  filesForOrder = new Map<number, number>();
  timeToGetApprovedByTl = new Map<number, string>();
  timeToGetApprovedByPpPp = new Map<number, string>();
  timeToFinish = new Map<number, string>();
  messageConversationService = inject(MessageConversationsService);
  fileService = inject(FilesService);

  ngOnInit(): void {
    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => this.allChecklists.set(x));

    this.orderService.ordersGet()
      .subscribe(x => {
        this.allOrders.set(x);
        this.updateOrders();
      });

      this.dataService.refreshPage('', '', 'containerRequestCS', '', true, true);
  }

  updateOrders() {
    this.filteredOrders.set(this.allOrders());

    if (this.selectedFilter() === 'CR') {
      this.filteredOrders.set(this.filteredOrders().filter(x => x.csid > 0 && x.tlid > 0));
    } else if (this.selectedFilter() === 'PP') {
      this.filteredOrders.set(this.filteredOrders().filter(x => x.ppId > 0));
    }

    const fromParts = this.fromDate().split("-");
    const toParts = this.toDate().split("-");

    const fromDate: Date = new Date(parseInt(fromParts[0]), parseInt(fromParts[1]) - 1, parseInt(fromParts[2]));
    const toDate: Date = new Date(parseInt(toParts[0]), parseInt(toParts[1]) - 1, parseInt(toParts[2]));

    if (this.fromDate() !== '' && this.toDate() !== '') {
      this.filteredOrders.set(this.filteredOrders().filter(order => {
        const createdOnParts = order.createdOn.split("-");

        const createdOnDate: Date = new Date(parseInt(createdOnParts[0]), parseInt(createdOnParts[1]) - 1, parseInt(createdOnParts[2]));

        return createdOnDate >= fromDate && createdOnDate <= toDate;
      }));
    }

    this.messagesForOrder = new Map<number, number>();
    this.filesForOrder = new Map<number, number>();
    this.timeToGetApprovedByTl = new Map<number, string>();
    this.timeToGetApprovedByPpPp = new Map<number, string>();
    this.timeToFinish = new Map<number, string>();
    this.filteredOrders().forEach(order => {

      if (this.selectedFilter() === 'CR') {
        this.tlinquiryService.tlinquiriesIdGet(order.tlid)
          .subscribe(tlinquiry => this.csinquiryService.csinquiriesIdGet(order.csid)
            .subscribe(csinquiry => this.timeToGetApprovedByTl.set(order.id, this.calculateDayDiff(csinquiry.approvedByCrCsTime, tlinquiry.approvedByCrTlTime)))
          );
      } else if (this.selectedFilter() === 'PP') {
        this.productionPlanningService.productionPlanningsIdGet(order.ppId)
          .subscribe(x => this.timeToGetApprovedByPpPp.set(order.id, this.calculateDayDiff(x.approvedByPpCsTime, x.approvedByPpPpTime)));
      }

      this.timeToFinish.set(order.id, this.calculateDayDiff(order.createdOn, order.finishedOn));

      this.messageConversationService.messageConversationsConversationIdGet(order.id)
        .subscribe(x => {
          const currentMessages = this.messagesForOrder;
          currentMessages.set(order.id, x.length);
          this.filesForOrder.set(order.id, 0);
          x.forEach(x => {
            if (x.attachmentId !== 0) {
              this.fileService.filesIdGet(x.attachmentId).subscribe(_ => {
                const currentFiles = this.filesForOrder;
                currentFiles.set(order.id, currentFiles.get(order.id)! + 1);
              });
            }
          });
        });
    });
  }

  showStepsForChecklist(id: number) {
    if (this.selectedChecklistId() === id) {
      this.selectedChecklistId.set(-1);
      this.allStepsForChecklist.set([]);
    } else {
      this.selectedChecklistId.set(id);
      this.stepService.stepsIdGet(id)
        .subscribe(x => this.allStepsForChecklist.set(x));
    }
  }

  getTimeForFinished(id: number): string {
    return this.timeToFinish.get(id) ?? 'No data.';
  }

  setSelectedStep(id: number): void {
    if (this.selectedChecklistId() === this.selectedStepId()) {
      this.selectedStepId.set(-1);
    } else {
      this.selectedStepId.set(id);
    }
  }

  editStep() {
    let editStepDto: EditStepDto = {
      id: this.selectedStepId(),
      stepNumber: this.stepNumber(),
      stepDescription: this.stepDescription(),
      stepName: this.stepName()
    };

    this.stepService.stepsPut(editStepDto)
      .subscribe(x => this.stepService.stepsIdGet(this.selectedChecklistId())
        .subscribe(x => this.allStepsForChecklist.set(x)));
  }

  postStep() {
    let stepDto: AddStepDto = {
      stepNumber: this.stepNumber(),
      checklistId: this.selectedChecklistId(),
      stepDescription: this.stepDescription(),
      stepName: this.stepName()
    };

    this.stepService.stepsPost(stepDto)
      .subscribe(x => this.stepService.stepsIdGet(this.selectedChecklistId())
        .subscribe(x => this.allStepsForChecklist.set(x)));
  }

  postChecklist() {
    let checklistDto: AddChecklistDto = {
      checklistname: this.checklistName(),
      generatedByAdmin: true
    }

    this.checklistService.checklistsPost(checklistDto)
      .subscribe(x => this.checklistService.checklistsGeneratedByAdminGet()
        .subscribe(x => this.allChecklists.set(x)));

    this.checklistName.set('');
  }

  calculateDayDiff(time1: string, time2: string): string {
    if (time1.length > 0 && time2.length > 0) {
      const [t1Year, t1Month, t1Day] = time1.split("-");
      const [t2Year, t2Month, t2Day] = time2.split("-");
      const newT1Date: Date = new Date(parseInt(t1Year), parseInt(t1Month) - 1, parseInt(t1Day));
      const newT2Date: Date = new Date(parseInt(t2Year), parseInt(t2Month) - 1, parseInt(t2Day));
      const timeDifferenceInMilliseconds = newT2Date.getTime() - newT1Date.getTime();
      const timeDifferenceInDays = (timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));

      return timeDifferenceInDays.toString();
    } else {
      return 'No data yet.';
    }
  }

  getAbNumberForOrder(orderId: number): number {
    return this.dataService.abNumberForOrder.get(orderId)!;
  }

  getCountForOrder(id: number, mapString: string): number {
    if (mapString == "messages") {
      return this.messagesForOrder.get(id) ?? 0;
    } else if (mapString == "files") {
      return this.filesForOrder.get(id) ?? 0;
    }
    return 0;
  }

  getTimeForApprovedByTl(id: number): string {
    return this.timeToGetApprovedByTl.get(id) ?? 'No data';
  }

  getTimeForApprovedByPp(id: number): string {
    return this.timeToGetApprovedByPpPp.get(id) ?? 'No data';
  }

  getAvgForOrder(mapString: string): number {
    let totalMessages = 0;
    let totalOrders = 0;
    let map = new Map<number, number>();
    if (mapString == "messages") {
      map = this.messagesForOrder;
    } else if (mapString == "files") {
      map = this.filesForOrder;
    }
    for (const [order, messagesCount] of map.entries()) {
      totalOrders++;
      totalMessages += messagesCount;
    }

    const avg = totalMessages / totalOrders;

    return Number(avg.toFixed(2));
  }

  getAvgTimeToGetApprovedBy(mapString:string): number {
    let totalDays = 0;
    let totalOrders = 0;
    let map = new Map<number, string>();
    if(mapString === 'tl'){
      map = this.timeToGetApprovedByTl;
    }else{
      map = this.timeToGetApprovedByPpPp;
    }    

    for (const value of map.values()) {
      if (value !== 'No data yet.') {
        totalOrders++;
        totalDays += parseFloat(value);
      }
    }

    if (totalOrders === 0) return 0;
    const avg = totalDays / totalOrders;

    return Number(avg.toFixed(2));
  }

  getAvgTimeToFinsish(): number {
    let totalDays = 0;
    let totalOrders = 0;

    for (const value of this.timeToFinish.values()) {
      if (value !== 'No data yet.') {
        totalOrders++;
        totalDays += parseFloat(value);
      }
    }

    if (totalOrders === 0) return 0;
    const avg = totalDays / totalOrders;

    return Number(avg.toFixed(2));
  }
}