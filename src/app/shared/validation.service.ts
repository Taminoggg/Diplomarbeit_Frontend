import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  simpleDatePattern = /^(?<year>\d{4})\-(?<month>0\d|1[0-2])\-(?<day>[0-2]\d|3[0-1])$/gm;
  simpleStringPattern = /^[ÖÄÜA-Z\d-,][äüöa-zA-Z\d-,]{0,30}(?:\s\w+)*$/gm;
  simpleNumberPattern = /^[0-9]{1,9}$/gm;
  simpleNumberGreaterZeroPattern = /^[1-9][0-9]{0,8}$/gm;
  simpleCharPattern = /^[A-Za-z]$/gm;
  numberWithCommaPattern = /^[1-9][0-9]{0,9}\.*[0-9]{0,9}$/gm;
  calenderWeekPattern = /^([1-9]|[1-4][0-9]|5[0-3])$/gm;

  isDateValid(date: string): boolean {
    let result = date.match(this.simpleDatePattern);
    return result !== null && result.length > 0;
  }

  isAnyInputValid(inputString: string): boolean {
    return inputString.length > 0 && inputString.length < 31;
  }
  
  isStringLengthOkay(inputString: string): boolean {
    return inputString.length < 31;
  }

  isAnyCharValid(nameString: string): boolean {
    let result = nameString.match(this.simpleCharPattern);
    return result !== null && result.length > 0;
  }

  isNameStringValid(nameString: string): boolean {
    let result = nameString.match(this.simpleStringPattern);
    return result !== null && result.length > 0;
  }

  isNumberValid(number: number): boolean {
    if (number === null) return false;
    let result = number.toString().match(this.simpleNumberPattern);
    return result !== null && result.length > 0;
  }

  isNumberGreaterZeroValid(number: number): boolean {
    if (number === null) return false;
    let result = number.toString().match(this.simpleNumberGreaterZeroPattern);
    return result !== null && result.length > 0;
  }

  isNumberWithCommaValid(number: number): boolean {
    if (number === null) return false;
    let result = number.toString().match(this.numberWithCommaPattern);
    return result !== null && result.length > 0;
  }

  isCalenderWeekValid(number: number): boolean {
    if (number === null) return false;
    let result = number.toString().match(this.calenderWeekPattern);
    return result !== null && result.length > 0;
  }
}
