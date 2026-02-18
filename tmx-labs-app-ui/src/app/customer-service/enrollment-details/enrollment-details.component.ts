import { ChangeDetectionStrategy, Component, effect, inject, input, InputSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { LiveAnnouncer } from '@angular/cdk/a11y';
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
  private liveAnnouncer = inject(LiveAnnouncer);

  details: InputSignal<EnrollmentDetails | null> = input<EnrollmentDetails | null>(null);

  hasAccounts = computed(() => (this.details()?.accounts?.length ?? 0) > 0);

  constructor() {
    // Watch for details changes and announce
    effect(() => {
      const detail = this.details();
      if (detail) {
        this.liveAnnouncer.announce(
          `Viewing enrollment details for ${detail.customer.user.firstName} ${detail.customer.user.lastName}`,
          'assertive'
        );
      }
    });
  }
}
