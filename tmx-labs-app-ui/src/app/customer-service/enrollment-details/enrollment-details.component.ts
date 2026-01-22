import { ChangeDetectionStrategy, Component, InputSignal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { EnrollmentDetails } from 'src/app/shared/data/participant/resources';
import { EnrollmentCustomerDetailsComponent } from './customer-details/customer-details.component';
import { ParticipantDetailsComponent } from './participant-details/participant-details.component';

@Component({
  selector: 'tmx-enrollment-details',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, EnrollmentCustomerDetailsComponent, ParticipantDetailsComponent],
  templateUrl: './enrollment-details.component.html',
  styleUrls: ['./enrollment-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrollmentDetailsComponent {
  details: InputSignal<EnrollmentDetails | null> = input<EnrollmentDetails | null>(null);

  hasAccounts = computed(() => (this.details()?.accounts?.length ?? 0) > 0);
}
