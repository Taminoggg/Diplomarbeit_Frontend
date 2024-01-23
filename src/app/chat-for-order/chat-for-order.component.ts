import { Component, Input, OnInit, computed, inject, numberAttribute, signal } from '@angular/core';
import { AddMessageConversationDto, AddMessageDto, ConversationDto, ConversationsService, FileByteDto, FileDto, FilesService, MessageConversationsService, MessageDto, MessagesService } from '../shared/swagger';
import { NgSignalDirective } from '../shared/ngSignal.directive';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-chat-for-order',
  standalone: true,
  imports: [NgSignalDirective, DecimalPipe, TranslocoModule, MatIconModule],
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
  filesService = inject(FilesService);

  fileForMessage = new Map<number, File>;
  hasMessageContent = computed(() => this.messageContent().trim());
  messageContent = signal<string>(' ');
  messagesForConversation = signal<MessageDto[]>([]);
  conversation = signal<ConversationDto>(
    {
      orderId: 0,
      id: 0
    });

  ngOnInit(): void {
    this.conversationService.conversationsOrderIdGet(this.id)
      .subscribe(x => {
        if (x.id != 0) {
          this.conversation.set(x);
          console.log('conversation set')
        } else {
          console.log('new conversation added')
          this.conversationService.conversationsPost(this.id)
            .subscribe(x => this.conversation.set(x));
        }

        this.getMessagesForConversation();
      });
  }

  getMessagesForConversation() {
    this.messageConversationService.messageConversationsConversationIdGet(this.conversation().id)
      .subscribe(x => {
        this.messagesForConversation.set(x);
        this.messagesForConversation().forEach((message: MessageDto) => {
          if (message.attachmentId !== 1) {
            this.filesService.filesIdGet(message.attachmentId)
              .subscribe(x => {
                const fileDto: FileByteDto = {
                  fileName: x.fileName,
                  fileContent: x.fileContent,
                  fileType: x.fileType
                };

                const binaryData = atob(fileDto.fileContent);

                const arrayBuffer = new ArrayBuffer(binaryData.length);
                const view = new Uint8Array(arrayBuffer);
                for (let i = 0; i < binaryData.length; i++) {
                  view[i] = binaryData.charCodeAt(i);
                }

                const mimeType = this.getMimeType(fileDto.fileType);

                const blob = new Blob([arrayBuffer], { type: mimeType });

                const file = new File([blob], fileDto.fileName);

                this.fileForMessage.set(message.id, file);
              });
          };
        })
      });
  }

  fileForMessageExsits(id: number): boolean {
    let file = this.fileForMessage.get(id);

    if (file !== undefined) {
      return true;
    }
    return false;
  }

  getFileName(id:number): string{
    let file = this.fileForMessage.get(id);

    if (file !== undefined) {
      return file.name;
    }
    return '';
  }

  downloadFile(id: number): void {
    let file = this.fileForMessage.get(id);

    if (file !== undefined) {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.download = file.name;
      link.click();
    }
  }

  private getMimeType(fileType: string): string {
    switch (fileType) {
      case '.pdf':
        return 'application/pdf';
      case '.html':
        return 'text/html';
      case '.xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  shortendName(name:string){
    if (name.length < 40 ) return name
    return name.substring(0, 40) + '...';
  }

  sendMessage(): void {
    let message: AddMessageDto = {
      content: "",
      attachmentId: 1
    };

    if (this.fileToUpload !== null) {
      this.filesService.filesPost(this.fileToUpload)
        .subscribe(x => {
          message = {
            content: this.messageContent(),
            attachmentId: x.id
          };
          this.postMessage(message);
        });
    } else {
      message = {
        content: this.messageContent(),
        attachmentId: 1
      };
      this.postMessage(message);
    }
  }

  postMessage(message: AddMessageDto) {
    console.log(message.attachmentId);
    console.log(message.content);
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
    this.fileToUpload = null;
  }

  handleFileInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement && inputElement.files && inputElement.files.length > 0) {
      this.fileToUpload = inputElement.files.item(0);
    }
  }

  removeFile() {
    this.fileToUpload = null;
  }

  navigateToHomePage() {
    this.router.navigateByUrl('/function-overview-age');
  }
}
