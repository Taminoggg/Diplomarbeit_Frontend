import { Component, Input, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-chat-for-order',
  standalone: true,
  imports: [],
  templateUrl: './chat-for-order.component.html',
  styleUrl: './chat-for-order.component.scss'
})
export class ChatForOrderComponent {
  @Input({ transform: numberAttribute }) id = 0;
 
  
}
