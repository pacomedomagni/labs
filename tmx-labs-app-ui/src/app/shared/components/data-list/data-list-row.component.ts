import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InputSignal,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  input,
  inject,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HelpTextIconComponent } from '../help-text-icon/help-text-icon.component';

@Component({
  selector: 'tmx-data-list-row',
  standalone: true,
  imports: [CommonModule, NgClass, MatIconModule, HelpTextIconComponent],
  templateUrl: './data-list-row.component.html',
  styleUrls: ['./data-list-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataListRowComponent implements OnInit {
  label = input<string | null>(null);
  labelSpan: InputSignal<number | string | null> = input<number | string | null>(null);
  decoratorIcon = input<string | null>(null);
  decoratorIconClass = input<string | null>(null);
  screenReaderLabel = input<string | null>(null);
  rowClass = input<string | null>(null);
  colClass = input<string | null>(null);
  labelHelpKey = input<string | null>(null);
  contentHelpKey = input<string | null>(null);

  @ViewChild(TemplateRef, { read: TemplateRef, static: true })
  template!: TemplateRef<void>;

  private readonly renderer2 = inject(Renderer2);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  ngOnInit(): void {
    const comment = this.renderer2.createComment('tmx-data-list-row');
    const parentNode = this.renderer2.parentNode(this.elementRef.nativeElement);
    this.viewContainerRef.createEmbeddedView(this.template);
    this.renderer2.insertBefore(parentNode, comment, this.elementRef.nativeElement);
    this.renderer2.removeChild(parentNode, this.elementRef.nativeElement);
  }
}
