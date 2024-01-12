import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-container-tool-function',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './container-tool-function.component.html',
  styleUrls: ['./container-tool-function.component.scss']
})
export class ContainerToolFunctionComponent {
  private router = inject(Router);
  @Input() toolFunctionName: string = "";
  @Input() toolFunctionDescription: string = "";
  @Input() redirectRoute: string = "";


  redirectToRoute(): void {
    this.router.navigateByUrl(this.redirectRoute);
  }
}
