import { Directive, HostListener, ElementRef } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: "[guidFormat]",
    standalone: false
})
export class GuidFormatDirective {

  constructor(private el: ElementRef,  private control: NgControl) {}

  @HostListener("paste", ["$event"])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const input = this.el.nativeElement as HTMLInputElement;
    const pastedText = event.clipboardData?.getData("text/plain") || "";
    input.value = this.formatGUID(pastedText);
    this.control.control?.setValue(input.value);
  }

  @HostListener("input", ["$event"]) onInputChange(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    input.value = this.formatGUID(input.value);
    this.control.control?.setValue(input.value);
  }

  private formatGUID(value:string): string {
    let cleaned = ("" + value).replace(/[^a-fA-F0-9]/g, "").toLowerCase();
    if (cleaned.length > 32) {
      cleaned = cleaned.substring(0, 32);
    }
    let formatted = "";
    if (cleaned.length > 8) {
      formatted += cleaned.substring(0, 8) + "-";
      cleaned = cleaned.substring(8);
    }
    if (cleaned.length > 4) {
      formatted += cleaned.substring(0, 4) + "-";
      cleaned = cleaned.substring(4);
    }
    if (cleaned.length > 4) {
      formatted += cleaned.substring(0, 4) + "-";
      cleaned = cleaned.substring(4);
    }
    if (cleaned.length > 4) {
      formatted += cleaned.substring(0, 4) + "-";
      cleaned = cleaned.substring(4);
    }
    formatted += cleaned;
    return formatted;
  }
}