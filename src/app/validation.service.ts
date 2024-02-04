import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  simpleDatePattern = /^(?<day>[0-2]\d|3[0-1])\.(?<month>0\d|1[0-2])\.(?<year>\d{4})$/gm;
  simpleStringPattern = /^[A-Z\d-,][a-zA-Z\d-,]*(?:\s\w+)*$/gm;
  simpleNumberPattern = /^[1-9]\d*$/gm;

  constructor() { }

  isReadyToLoadValid(readyToLoad: string): boolean {
    let result = readyToLoad.match(this.simpleDatePattern);
    return result !== null && result.length > 0;
  }

  isLoadingPlattfromValid(loadingPlattform: string): boolean {
    return loadingPlattform.length > 0;
  }

  isCustomerValid(customerName: string): boolean {
    return customerName.length > 0;
  }

  isCreatedByValid(createdBy: string): boolean {
    let result = createdBy.match(this.simpleStringPattern);
    return result !== null && result.length > 0;
  }

  isAbNumberValid(abnumber: number): boolean {
    let result = abnumber.toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  }

  isGrossWeightInKgValid(grossWeightInKg: number): boolean {
    let result = grossWeightInKg.toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  }

  isStatusValid(status: string): boolean {
    return status.length > 0;
  }

  isAmountValid(amount: number): boolean {
    let result = amount.toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  }

  isContainerSizeValid(containersize: number): boolean {
    let result = containersize.toString().match(this.simpleNumberPattern);
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
