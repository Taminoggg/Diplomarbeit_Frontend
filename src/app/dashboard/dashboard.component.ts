import { Component, OnInit, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../shared/data.service';
import { FilesService, MessageConversationsService } from '../shared/swagger';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  messagesForOrder = new BehaviorSubject<Map<number, number>>(new Map<number, number>());
  filesForOrder = new BehaviorSubject<Map<number, number>>(new Map<number, number>());
  timeToGetApprovedByTl = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  timeToGetApprovedByPpCs = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  timeToGetApprovedByPpPp = new BehaviorSubject<Map<number, string>>(new Map<number, string>());

  dataService = inject(DataService);
  messageConversationService = inject(MessageConversationsService);
  fileService = inject(FilesService);

  ngOnInit(): void {
    this.dataService.refreshPage('none', '', '');

    this.dataService.allOrders().forEach(order => {
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

    this.dataService.allOrders().forEach(order => {
      this.timeToGetApprovedByTl.next(this.timeToGetApprovedByTl.value.set(order.id, this.calculateDayDiff(order.approvedByCsTime, order.approvedByTlTime)));
      this.timeToGetApprovedByPpCs.next(this.timeToGetApprovedByPpCs.value.set(order.id, this.calculateDayDiff(order.approvedByCsTime, order.approvedByPpCsTime)));
      this.timeToGetApprovedByPpPp.next(this.timeToGetApprovedByPpPp.value.set(order.id, this.calculateDayDiff(order.approvedByPpCsTime, order.approvedByPpPpTime)));
    });
  }

  calculateDayDiff(time1: string, time2: string): string {
    if (time1.length > 0 && time2.length > 0) {
      const [t1Day, t1Month, t1Year] = time1.split(".");
      const [t2Day, t2Month, t2Year] = time2.split(".");
      const newT1Date: Date = new Date(parseInt(t1Year), parseInt(t1Month) - 1, parseInt(t1Day));
      const newT2Date: Date = new Date(parseInt(t2Year), parseInt(t2Month) - 1, parseInt(t2Day));
      const timeDifferenceInMilliseconds = newT2Date.getTime() - newT1Date.getTime();
      const timeDifferenceInDays = timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24);

      return timeDifferenceInDays.toString();
    } else {
      return 'Not approved yet.';
    }
  }

  getCountForOrder(id: number, mapString:string): number {
    if (mapString == "messages") {
      return this.messagesForOrder.value.get(id) ?? 0;
    } else if (mapString == "files") {
      return this.filesForOrder.value.get(id) ?? 0;
    } 
    return 0;
  }

  getTimeForApprovedBy(id: number, mapString: string): string {
    if (mapString == "tl") {
      return this.timeToGetApprovedByTl.value.get(id) ?? '';
    } else if (mapString == "ppCs") {
      return this.timeToGetApprovedByPpCs.value.get(id) ?? '';
    } else if (mapString == "ppPp") {
      return this.timeToGetApprovedByPpPp.value.get(id) ?? '';
    }
    return '';
  }

  getAvgForOrder(mapString:string): number {
    let totalMessages = 0;
    let totalOrders = 0;
    let map = new Map<number, number>();
    if (mapString == "messages") {
      map = this.messagesForOrder.value;
    } else if (mapString == "files") {
      map = this.filesForOrder.value;
    } 
    for (const [order, messagesCount] of map.entries()) {
      totalOrders++;
      totalMessages += messagesCount;
    }

    const avg = totalMessages / totalOrders;

    return Number(avg.toFixed(2));
  }

  getAvgTimeToGetApprovedBy(mapString: string): number {
    let totalDays = 0;
    let totalOrders = 0;
    let map = new Map<number, string>();
    if (mapString == "tl") {
      map = this.timeToGetApprovedByTl.value;
    } else if (mapString == "ppCs") {
      map = this.timeToGetApprovedByPpCs.value;
    } else if (mapString == "ppPp") {
      map = this.timeToGetApprovedByPpPp.value;
    }
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