import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, TranslocoModule, FormsModule, DropdownModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'DAFrontend';
  router = inject(Router);
  translocoService = inject(TranslocoService);
  selectedLanguage = {
    imgUrl: '/assets/images/de.jpeg',
    code: 'de',
    name: 'German',
    shorthand: 'GER',
  }

  navigateToHomePage() {
    this.router.navigateByUrl('/function-overview-age');
  }

  ngOnInit(): void {
    this.translocoService.setActiveLang(localStorage.getItem('language') ?? 'de');
    console.log(this.translocoService.getActiveLang());
    this.languagesList.forEach(language => {
      if(language.code === this.translocoService.getActiveLang()){
        this.selectedLanguage = language;
      }
    });
  }

  public languagesList: Array<
    Record<'imgUrl' | 'code' | 'name' | 'shorthand', string>
  > = [
      {
        imgUrl: '/assets/images/de.jpeg',
        code: 'de',
        name: 'German',
        shorthand: 'GER',
      },
      {
        imgUrl: '/assets/images/en.jpeg',
        code: 'en',
        name: 'English',
        shorthand: 'ENG',
      },
      //{
      //imgUrl: '/assets/images/pl.jpeg',
      //code: 'pl',
      //name: 'Polnish',
      //shorthand: 'PL',
      //},
    ];

  changeLanguage(selectedLanguage: string): void {
    let currLang = JSON.stringify(selectedLanguage).split(',')[1].split(':')[1].split('"')[1]
    this.translocoService.setActiveLang(currLang);
    localStorage.setItem('language', currLang);
  }
}
