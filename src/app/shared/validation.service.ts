import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  simpleDatePattern = /^(?<day>[0-2]\d|3[0-1])\.(?<month>0\d|1[0-2])\.(?<year>\d{4})$/gm;
  simpleStringPattern = /^[A-Z\d-,][a-zA-Z\d-,]*(?:\s\w+)*$/gm;
  simpleNumberPattern = /^[1-9]\d*$/gm;

  isDateValid(date: string): boolean {
    let result = date.match(this.simpleDatePattern);
    return result !== null && result.length > 0;
  }

  isAnyInputValid(inputString: string): boolean {
    return inputString.length > 0;
  }

  isNameStringValid(nameString: string): boolean {
    let result = nameString.match(this.simpleStringPattern);
    return result !== null && result.length > 0;
  }

  isNumberValid(number: number): boolean {
    if(number === null) return false;
    let result = number.toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  }

  setAreArticleNumbersValid(articlesFormArray: FormArray, areArticleNumbersValid: (value: boolean) => void): void {
    for (let i = 0; i < articlesFormArray.length; i++) {
      const articleNumber = articlesFormArray.at(i).get('articleNumber')?.value;
      const directLine = articlesFormArray.at(i).get('directline')?.value;
      const palletAmount = articlesFormArray.at(i).get('palletAmount')?.value;

      if (articleNumber < 1 || (directLine && palletAmount < 1)) {
        areArticleNumbersValid(false);
        return;
      }
    }
    areArticleNumbersValid(true);
  }
}
