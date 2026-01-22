import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tmx-data-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataListComponent {
  density: InputSignal<'condensed' | 'normal'> = input<'condensed' | 'normal'>('normal');
  border = input<boolean>(true);
}
