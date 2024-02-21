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
    this.dataService.allOrders().forEach(order => {
      this.messageConversationService.messageConversationsConversationIdGet(order.id)
      .subscribe(x => this.messagesForOrder.set(order.id, x.count()));
    });
  }

  dataService = inject(DataService);
  messageConversationService = inject(MessageConversationsService);

  messagesForOrder = new Map<number, number>;

  getMessagesCountForOrder(id:number){
    return this.messagesForOrder.get(id);
  }
}
