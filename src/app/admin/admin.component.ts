import { Component, OnInit, inject, signal } from '@angular/core';
import { AddChecklistDto, AddStepDto, ChecklistDto, ChecklistsService, CsinquiriesService, FilesService, MessageConversationsService, OrderDto, OrdersService, ProductionPlanningsService, StepDto, StepsService, TlinquiriesService } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';
import { TranslocoModule } from '@ngneat/transloco';
import { EditStepDto } from '../shared/swagger/model/editStepDto';
import { DataService } from '../shared/data.service';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, from } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgSignalDirective, TranslocoModule, MatIconModule],
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
  allOrders = signal<OrderDto[]>([]);
  messagesForOrder = new BehaviorSubject<Map<number, number>>(new Map<number, number>());
  filesForOrder = new BehaviorSubject<Map<number, number>>(new Map<number, number>());
  timeToGetApprovedByTl = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  timeToGetApprovedByPpPp = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  messageConversationService = inject(MessageConversationsService);
  fileService = inject(FilesService);

  ngOnInit(): void {
    this.checklistService.checklistsGeneratedByAdminGet()
      .subscribe(x => this.allChecklists.set(x));

    this.updateOrders();
  }

  updateOrders() {
    this.orderService.ordersGet()
      .subscribe(x => {
        this.allOrders.set(x);

        const fromParts = this.fromDate().split("-");
        const toParts = this.toDate().split("-");

        const fromDate: Date = new Date(parseInt(fromParts[0]), parseInt(fromParts[1]) - 1, parseInt(fromParts[2]));
        const toDate: Date = new Date(parseInt(toParts[0]), parseInt(toParts[1]) - 1, parseInt(toParts[2]));

        if(this.fromDate() !== '' && this.toDate() !== ''){
          this.allOrders.set(this.dataService.allOrders().filter(order => {
            const lastUpdatedParts = order.lastUpdated.split("-");
  
            const lastUpdatedDate: Date = new Date(parseInt(lastUpdatedParts[0]), parseInt(lastUpdatedParts[1]) - 1, parseInt(lastUpdatedParts[2]));
            return lastUpdatedDate >= fromDate && lastUpdatedDate <= toDate;
          }));
        }
        

        this.allOrders().forEach(order => {
          this.tlinquiryService.tlinquiriesIdGet(order.tlid)
            .subscribe(tlinquiry => this.csinquiryService.csinquiriesIdGet(order.csid)
              .subscribe(csinquiry => this.timeToGetApprovedByTl.next(this.timeToGetApprovedByTl.value.set(order.id, this.calculateDayDiff(csinquiry.approvedByCrCsTime, tlinquiry.approvedByCrTlTime))))
            );

          this.productionPlanningService.productionPlanningsIdGet(order.ppId)
            .subscribe(x => this.timeToGetApprovedByPpPp.next(this.timeToGetApprovedByPpPp.value.set(order.id, this.calculateDayDiff(x.approvedByPpCsTime, x.approvedByPpPpTime))));
        });

        this.allOrders().forEach(order => {
          this.messagesForOrder = new BehaviorSubject<Map<number, number>>(new Map<number, number>());
          this.filesForOrder = new BehaviorSubject<Map<number, number>>(new Map<number, number>());

          this.messageConversationService.messageConversationsConversationIdGet(order.id)
            .subscribe(x => {
              const currentMessages = this.messagesForOrder.value;
              currentMessages.set(order.id, x.length);
              this.messagesForOrder.next(currentMessages);
              this.filesForOrder.next(this.filesForOrder.value.set(order.id, 0));
              x.forEach(x => {
                if (x.attachmentId !== 0) {
                  this.fileService.filesIdGet(x.attachmentId).subscribe(_ => {
                    const currentFiles = this.filesForOrder.value;
                    currentFiles.set(order.id, currentFiles.get(order.id)! + 1);
                    this.filesForOrder.next(currentFiles);
                  });
                }
              });
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

  setSelectedStep(id: number) {
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
      const timeDifferenceInDays = timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24);

      return timeDifferenceInDays.toString();
    } else {
      return 'Not approved yet.';
    }
  }

  getCountForOrder(id: number, mapString: string): number {
    if (mapString == "messages") {
      return this.messagesForOrder.value.get(id) ?? 0;
    } else if (mapString == "files") {
      return this.filesForOrder.value.get(id) ?? 0;
    }
    return 0;
  }

  getTimeForApprovedBy(id: number, mapString: string): string {
    return this.timeToGetApprovedByTl.value.get(id) ?? this.timeToGetApprovedByPpPp.value.get(id) ?? 'No data';
  }

  getAvgForOrder(mapString: string): number {
    console.log('getAVGForOrder');
    let totalMessages = 0;
    let totalOrders = 0;
    let map = new Map<number, number>();
    if (mapString == "messages") {
      console.log(this.messagesForOrder.value);
      map = this.messagesForOrder.value;
    } else if (mapString == "files") {
      console.log(this.filesForOrder.value);
      map = this.filesForOrder.value;
    }
    for (const [order, messagesCount] of map.entries()) {
      totalOrders++;
      totalMessages += messagesCount;
    }

    const avg = totalMessages / totalOrders;

    return Number(avg.toFixed(2));
  }

  getAvgTimeToGetApprovedBy(): number {
    let totalDays = 0;
    let totalOrders = 0;
    let tlMap = this.timeToGetApprovedByTl.value;
    let ppMap = this.timeToGetApprovedByPpPp.value
    let map = new Map<number, string>([...tlMap, ...ppMap]);

    for (const value of map.values()) {
      if (value !== 'Not approved yet.') {
        totalOrders++;
        totalDays += parseFloat(value);
      }
    }

    if (totalOrders === 0) return 0;
    const avg = totalDays / totalOrders;

    return Number(avg.toFixed(2));
  }
}