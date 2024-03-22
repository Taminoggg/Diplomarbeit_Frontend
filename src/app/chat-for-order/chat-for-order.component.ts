import { Component, Input, OnInit, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { AddMessageConversationDto, AddMessageDto, FileByteDto, FilesService, MessageConversationsService, MessageDto, MessagesService } from '../shared/swagger';
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
  @Input() htmlContent = '';
  @Input({ transform: numberAttribute }) id = 0;

  fileToUpload: File | null = null;

  router = inject(Router);
  messageService = inject(MessagesService);
  messageConversationService = inject(MessageConversationsService);
  filesService = inject(FilesService);

  fileForMessage = new Map<number, File>;
  hasMessageContent = computed(() => this.messageContent().trim());
  messageContent = signal<string>(' ');
  messagesForConversation = signal<MessageDto[]>([]);

  ngOnInit(): void {
    this.getMessagesForConversation();
  }

  getMessagesForConversation() {
    this.messageConversationService.messageConversationsConversationIdGet(this.id)
      .subscribe(x => {
        this.messagesForConversation.set(x);
        this.messagesForConversation().forEach((message: MessageDto) => {
          this.filesService.filesIdGet(message.attachmentId)
            .subscribe(x => {
              if (x !== null) {
                const fileDto: FileByteDto = {
                  fileName: x.fileName,
                  fileContent: x.fileContent,
                  fileType: x.fileType
                };

                console.log(fileDto.fileContent);
                const binaryData = atob(fileDto.fileContent);
                console.log(binaryData);
                const arrayBuffer = new ArrayBuffer(binaryData.length);
                const view = new Uint8Array(arrayBuffer);

                for (let i = 0; i < binaryData.length; i++) {
                  view[i] = binaryData.charCodeAt(i);
                }

                const mimeType = this.getMimeType(fileDto.fileType);
                const blob = new Blob([arrayBuffer], { type: mimeType });
                const file = new File([blob], fileDto.fileName);

                this.fileForMessage.set(message.id, file);
              }
            });
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

  getFileName(id: number): string {
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

  shortendName(name: string) {
    if (name.length < 40) return name
    return name.substring(0, 40) + '...';
  }

  sendMessage(): void {
    let from = '';

    if (this.htmlContent === "containerRequestCS" || this.htmlContent === "productionPlanningCS") {
      from = 'CS';
    } else if (this.htmlContent === "containerRequestTL") {
      from = 'TL';
    } else if (this.htmlContent === "productionPlanningPP") {
      from = 'PP';
    } else {
      from = 'unknown';
    }

    let message: AddMessageDto = {
      content: ""
    };

    if (this.fileToUpload !== null) {
      this.filesService.filesPost(this.fileToUpload)
        .subscribe(x => {
          message = {
            content: this.messageContent(),
            attachmentId: x.id,
            from: from
          };
          this.postMessage(message);
        });
    } else {
      message = {
        content: this.messageContent(),
        from: from
      };
      this.postMessage(message);
    }
  }

  postMessage(message: AddMessageDto) {
    this.messageService.messagesPost(message)
      .subscribe(x => {
        let messageConversation: AddMessageConversationDto = {
          orderId: this.id,
          messageId: x.id
        }

        this.messageConversationService.messageConversationsPost(messageConversation)
          .subscribe(x => this.getMessagesForConversation());
      });

    this.messageContent.set('');
    this.removeFile();
  }

  handleFileInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement && inputElement.files && inputElement.files.length > 0) {
      this.fileToUpload = inputElement.files.item(0);
    }
    else {
      this.fileToUpload = null;
    }
  }

  removeFile() {
    this.fileToUpload = null;
    var fileForm = document.getElementById("fileForm") as HTMLFormElement;
    if (fileForm !== null) {
      fileForm.reset();
    } else {
      console.log("File form element not found.");
    }
  }

  navigateBack() {
    this.router.navigateByUrl('/container-request-page/' + this.htmlContent);
  }
}