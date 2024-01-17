import { Component, Input, OnInit, computed, inject, numberAttribute, signal } from '@angular/core';
import { AddMessageConversationDto, AddMessageDto, ConversationDto, ConversationsService, MessageConversationsService, MessageDto, MessagesService } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';
import { formatNumber, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';


@Component({
  selector: 'app-chat-for-order',
  standalone: true,
  imports: [NgSignalDirective, DecimalPipe, TranslocoModule],
  templateUrl: './chat-for-order.component.html',
  styleUrl: './chat-for-order.component.scss'
})
export class ChatForOrderComponent implements OnInit {
  @Input({ transform: numberAttribute }) id = 0;

  fileToUpload: File | null = null;

  router = inject(Router);
  conversationService = inject(ConversationsService);
  messageService = inject(MessagesService);
  messageConversationService = inject(MessageConversationsService);

  hasMessageContent = computed(() => this.messageContent().trim());
  messageContent = signal<string>("");
  messagesForConversation = signal<MessageDto[]>([]);
  conversation = signal<ConversationDto>(
    {
      orderId: 0,
      id: 0
    });

  ngOnInit(): void {
    this.conversationService.conversationsOrderIdGet(this.id)
      .subscribe(x => {
        if(x.id != 0){
          this.conversation.set(x);
          console.log('conversation set')
          console.log(this.conversation())
        }else{
          console.log('new conversation added')
          this.conversationService.conversationsPost(this.id)
            .subscribe(x => this.conversation.set(x));
        }

        this.getMessagesForConversation();
      });
  }

  getMessagesForConversation() {
    this.messageConversationService.messageConversationsIdGet(this.conversation().id)
      .subscribe(x => this.messagesForConversation.set(x));
  }

  sendMessage(): void {
    console.log('messageContent: ' + this.messageContent());
    console.log(this.conversation());

    let message: AddMessageDto = {
      content: "",
      attachmentId: 1
    };

    if (this.fileToUpload !== null) {
      //TODO
      message = {
        content: this.messageContent(),
        attachmentId: 1
      };
    } else {
      message = {
        content: this.messageContent(),
        attachmentId: 1
      };
    }

    this.messageService.messagesPost(message)
      .subscribe(x => {

        let messageConversation: AddMessageConversationDto = {
          conversationId: this.conversation().id,
          messageId: x.id
        }

        this.messageConversationService.messageConversationsPost(messageConversation)
          .subscribe(x => this.getMessagesForConversation());
      });

      this.messageContent.set('');
  }

  handleFileInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement && inputElement.files && inputElement.files.length > 0) {
      this.fileToUpload = inputElement.files.item(0);
    }
  }

  removeFile(){
    this.fileToUpload = null;
  }

  navigateToHomePage(){
    this.router.navigateByUrl('/function-overview-age');
  }
}
