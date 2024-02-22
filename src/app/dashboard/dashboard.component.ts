import { Component, OnInit, inject } from '@angular/core';
import { DataService } from '../shared/data.service';
import { ChecklistsService, MessageConversationsService } from '../shared/swagger';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
    this.dataService.refreshPage('none', '', '');

    this.dataService.allOrders().forEach(order => {
      this.messageConversationService.messageConversationsConversationIdGet(order.id)
        .subscribe(x => this.messagesForOrder.set(order.id, x.count()));
    });

    this.dataService.allOrders().forEach(order => {
      this.timeToGetApprovedByTl.set(order.id, this.calculateDayDiff(order.approvedByCsTime, order.approvedByTlTime, order.id));
      this.timeToGetApprovedByPPCs.set(order.id, this.calculateDayDiff(order.approvedByCsTime, order.approvedByPpCsTime, order.id));
    });
  }

  dataService = inject(DataService);
  messageConversationService = inject(MessageConversationsService);

  messagesForOrder = new Map<number, number>;
  timeToGetApprovedByTl = new Map<number, string>
  timeToGetApprovedByPPCs = new Map<number, string>

  calculateDayDiff(time1:string, time2:string, orderId:number):string{
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

  getMessagesCountForOrder(id: number) {
    return this.messagesForOrder.get(id);
  }

  getTimeForApprovedByTl(id: number) {
    return this.timeToGetApprovedByTl.get(id);
  }

  getTimeForApprovedByPpCs(id: number) {
    return this.timeToGetApprovedByPPCs.get(id);
  }

  getAvgMessagesPerOrder(): number {
    let totalMessages = 0;
    let totalOrders = 0;

    for (const [order, messagesCount] of this.messagesForOrder.entries()) {
      totalOrders++;
      totalMessages += messagesCount;
    }

    const avg = totalMessages / totalOrders;

    return Number(avg.toFixed(2));
  }

  getAvgTimeToGetApprovedByTl(): number {
    let totalDays = 0;
    let totalOrders = 0;
    for (const value of this.timeToGetApprovedByTl.values()) {
      if (value !== 'Not approved yet.') {
        totalOrders++;
        totalDays += parseFloat(value);
      }
    }

    const avg = totalDays / totalOrders;

    return Number(avg.toFixed(2)); 
  }

  getAvgTimeToGetApprovedByPpCs(): number {
    let totalDays = 0;
    let totalOrders = 0;
    for (const value of this.timeToGetApprovedByPPCs.values()) {
      if (value !== 'Not approved yet.') {
        totalOrders++;
        totalDays += parseFloat(value);
      }
    }

    const avg = totalDays / totalOrders;

    return Number(avg.toFixed(2)); 
  }
}
