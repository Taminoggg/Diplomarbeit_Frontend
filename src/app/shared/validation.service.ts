import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  simpleDatePattern = /^(?<year>\d{4})\-(?<month>0\d|1[0-2])\-(?<day>[0-2]\d|3[0-1])$/gm;
  simpleStringPattern = /^[ÖÄÜA-Z\d-,][äüöa-zA-Z\d-,]*(?:\s\w+)*$/gm;
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
}
