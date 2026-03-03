import { Directive, HostListener, ElementRef } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: "[phoneNumberFormat]",
    standalone: false
})
export class PhoneNumberFormatDirective {

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener("paste", ["$event"])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const input = this.el.nativeElement as HTMLInputElement;
    const pastedText = event.clipboardData?.getData("text/plain") || "";
    input.value = this.formatPhoneNumber(pastedText);
    this.control.control?.setValue(input.value);
  }

  @HostListener("input", ["$event"]) onInputChange(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    input.value = this.formatPhoneNumber(input.value);
    this.control.control?.setValue(input.value);
  }

  private formatPhoneNumber(value :string) : string {
    let cleaned = ("" + value).replace(/\D/g, "");
    let match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      value = (!match[2] ? match[1] : "(" + match[1] + ") " + match[2] + (match[3] ? "-" + match[3] : ""));
    }
    return value;
  }
}