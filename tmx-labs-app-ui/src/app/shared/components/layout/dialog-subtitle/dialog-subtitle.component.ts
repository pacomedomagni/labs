import { Component, EventEmitter, input, Output } from '@angular/core';
import { CoreUiModule } from "@pgr-cla/core-ui-components";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tmx-dialog-subtitle',
  imports: [CoreUiModule, MatIcon, CommonModule],
  templateUrl: './dialog-subtitle.component.html',
  styleUrl: './dialog-subtitle.component.scss',
})
export class DialogSubtitleComponent {

  /**
   * HTML to inject on the left side of the subtitle bar (Required)
   */
  leftContent = input.required<string>();

  /**
   * Text to display on the right side of the subtitle bar (Optional)
   */
  rightText = input<string>();

  /**
   * Indicates if the right text is an action (clickable)
   */
  rightTextIsAction = input<boolean>(false);

  /**
  * Event emitted when the right text is clicked
  */
  @Output() rightTextClicked: EventEmitter<void> = new EventEmitter<void>();


}
