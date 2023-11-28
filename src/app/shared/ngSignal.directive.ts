/***********************************************************************
 * Author:          DI Robert Grüneis/HTL Grieskirchen
 * Version:         2.1.3
 * Date:            2023-11-19
 * Angular version: 17
 * TODO:            <select>/<option>: use ngValue to avoid value="item|json"
 ***********************************************************************/
import { JsonPipe } from '@angular/common';
import { Directive, ElementRef, Injector, Input, OnInit, WritableSignal, effect, inject } from '@angular/core';

console.log('using NgSignalDirective v2.1.3 [2023-11-19]');

@Directive({
  selector: '[ngSignal]',
  standalone: true,
  host: {
    '(change)': 'setValueToSignal()',
    '(keyup)': 'setValueToSignal()',
  },
})
export class NgSignalDirective<T> implements OnInit {
  private injector = inject(Injector);
  private jsonPipe = new JsonPipe(); //jsonPipe generates different string as JSON.stringify()

  private ele: HTMLInputElement | HTMLSelectElement = null!;
  private valueType = 'string';
  private inputType = 'unknown';
  private isTriggeredFromOwnEvent = false;

  @Input({ required: true }) ngSignal: WritableSignal<T> = null!;
  @Input() ngSignalLog = '';

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.ele = this.elementRef.nativeElement as HTMLInputElement | HTMLSelectElement;
    const val = this.ngSignal();
    this.valueType = (typeof val).toLowerCase();
    this.inputType = this.elementRef.nativeElement.type;
    if (this.valueType === 'object' && val) this.valueType = (val as object).constructor.name.toLowerCase();
    if (this.ngSignalLog) console.log(`[ngSignal] ngOnInit: ${this.ngSignalLog} (valueType=${this.valueType} / inputType=${this.inputType})`);
    if (this.inputType === 'radio' && val == this.ele.value) this.setValueToSignal();
    this.setValueToElement(val);

    effect(() => {
      if (this.ngSignalLog) console.log(`[ngSignal] ${this.ngSignalLog} effect --> ${this.ngSignal()} (${typeof (this.ngSignal())}) / isTriggeredFromOwnEvent --> ${this.isTriggeredFromOwnEvent}`);
      if (!this.isTriggeredFromOwnEvent) this.setValueToElement(this.ngSignal());
      this.isTriggeredFromOwnEvent = false;
    }, { injector: this.injector });
  }

  private setValueToElement(value: T): void {
    if (this.inputType === 'radio') {
      if (value && value == this.ele.value) (this.ele as any)['checked'] = true;
      return;
    }
    let sVal = `${value}`;
    if (this.valueType === 'date') {
      const strVal = (value as Date).toLocaleDateString(); //24.12.2023
      const p = strVal.split('.');
      const dateStringWithCorrectFormat = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`; //2023-12-24
      sVal = dateStringWithCorrectFormat;
    }
    else if (this.inputType === 'checkbox') {
      if (value) (this.ele as any)['checked'] = true;
    }
    else if (this.inputType === 'select-one') {
      if (this.valueType === 'object') sVal = this.jsonPipe.transform(value);
    }
    if (this.ngSignalLog) console.log(`[ngSignal] setValueToElement ${this.ngSignalLog} --> ${sVal} (${typeof (value)})`);
    setTimeout(() => this.ele.value = sVal, 0);
  }

  private setValueToSignal(): void {
    let value: any = this.inputType === 'checkbox' ? (this.ele as any)['checked'] : this.ele.value;
    // if (this.ngSignalLog) console.log(`[ngSignal] setValueToSignal ${this.ngSignalLog}: trying to set ${value} for type ${this.valueType}`);
    const valueOriginal = value;
    if (this.valueType === 'number') value = parseFloat(value);
    if (this.valueType === 'date') value = new Date(value);
    if (this.valueType === 'boolean' || this.valueType === 'object') value = JSON.parse(value);
    if (this.ngSignalLog) console.log(`[ngSignal] setValueToSignal ${this.ngSignalLog} --> ${valueOriginal} (${typeof (value)})`);
    if (this.inputType === 'radio' && value) (this.ele as any)['checked'] = true;
    this.ngSignal.set(value as T);
    this.isTriggeredFromOwnEvent = false;
  }
}
