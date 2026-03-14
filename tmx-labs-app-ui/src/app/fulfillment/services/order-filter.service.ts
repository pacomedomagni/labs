import { Injectable, signal, computed } from '@angular/core';

export interface PendingOrderFilters {
  states: string[];
  deviceType: string;
  snapshotVersion: string;
  statuses: string[];
}

export interface CompletedOrderFilters {
  processedBy: string[];
  startDate: Date;
  endDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderFilterService {
  // Default values
  private readonly DEFAULT_PENDING_FILTERS: PendingOrderFilters = {
    states: [],
    deviceType: 'all',
    snapshotVersion: 'all',
    statuses: ['Pending Assignment', 'Ready to Print']
  };

  private readonly getDefaultCompletedFilters = (): CompletedOrderFilters => ({
    processedBy: [],
    startDate: new Date(),
    endDate: new Date()
  });

  /**
   * Creates pending order filter state management
   */
  createPendingOrderFilterState() {
    // Unapplied filter state signals (user selections before clicking APPLY)
    const unappliedStates = signal<string[]>([]);
    const unappliedDeviceType = signal<string>('all');
    const unappliedSnapshotVersion = signal<string>('all');
    const unappliedStatuses = signal<string[]>(['Pending Assignment', 'Ready to Print']);

    // Applied filter state signals (active filters after clicking APPLY)
    const appliedStates = signal<string[]>([]);
    const appliedDeviceType = signal<string>('all');
    const appliedSnapshotVersion = signal<string>('all');
    const appliedStatuses = signal<string[]>(['Pending Assignment', 'Ready to Print']);

    // Computed: whether all unapplied statuses are selected
    const allUnappliedStatusesSelected = computed(() => {
      const selected = unappliedStatuses();
      return selected.includes('Pending Assignment') && selected.includes('Ready to Print');
    });

    // Computed: whether all applied statuses are selected
    const allAppliedStatusesSelected = computed(() => {
      const selected = appliedStatuses();
      return selected.includes('Pending Assignment') && selected.includes('Ready to Print');
    });

    // Computed: whether unapplied filters are at their default values
    const isUnappliedFilterDefault = computed(() => {
      return unappliedStates().length === 0
        && unappliedDeviceType() === 'all'
        && unappliedSnapshotVersion() === 'all'
        && allUnappliedStatusesSelected();
    });

    // Computed: whether applied filters are at their default values
    const isAppliedFilterDefault = computed(() => {
      const allAppliedStatusesSelected = appliedStatuses().includes('Pending Assignment')
        && appliedStatuses().includes('Ready to Print');

      return appliedStates().length === 0
        && appliedDeviceType() === 'all'
        && appliedSnapshotVersion() === 'all'
        && allAppliedStatusesSelected;
    });

    // Computed: whether unapplied filters differ from applied filters (to enable APPLY button)
    const hasUnappliedChanges = computed(() => {
      const statesChanged = JSON.stringify(unappliedStates()) !== JSON.stringify(appliedStates());
      const deviceTypeChanged = unappliedDeviceType() !== appliedDeviceType();
      const versionChanged = unappliedSnapshotVersion() !== appliedSnapshotVersion();
      const statusesChanged = JSON.stringify(unappliedStatuses()) !== JSON.stringify(appliedStatuses());

      return statesChanged || deviceTypeChanged || versionChanged || statusesChanged;
    });

    // Apply filters - copies unapplied to applied
    const applyFilters = () => {
      appliedStates.set(unappliedStates());
      appliedDeviceType.set(unappliedDeviceType());
      appliedSnapshotVersion.set(unappliedSnapshotVersion());
      appliedStatuses.set(unappliedStatuses());
    };

    // Clear filters - resets both unapplied and applied to defaults
    const clearFilters = () => {
      unappliedStates.set(this.DEFAULT_PENDING_FILTERS.states);
      unappliedDeviceType.set(this.DEFAULT_PENDING_FILTERS.deviceType);
      unappliedSnapshotVersion.set(this.DEFAULT_PENDING_FILTERS.snapshotVersion);
      unappliedStatuses.set(this.DEFAULT_PENDING_FILTERS.statuses);
      applyFilters();
    };

    return {
      // Unapplied signals
      unappliedStates,
      unappliedDeviceType,
      unappliedSnapshotVersion,
      unappliedStatuses,
      // Applied signals
      appliedStates,
      appliedDeviceType,
      appliedSnapshotVersion,
      appliedStatuses,
      // Computed
      allUnappliedStatusesSelected,
      allAppliedStatusesSelected,
      isUnappliedFilterDefault,
      isAppliedFilterDefault,
      hasUnappliedChanges,
      // Methods
      applyFilters,
      clearFilters
    };
  }

  /**
   * Creates completed order filter state management
   */
  createCompletedOrderFilterState() {
    // Unapplied filter state signals (user selections before clicking APPLY)
    const unappliedProcessedBy = signal<string[]>([]);
    const unappliedStartDate = signal<Date>(new Date());
    const unappliedEndDate = signal<Date>(new Date());

    // Applied filter state signals (active filters after clicking APPLY)
    const appliedProcessedBy = signal<string[]>([]);
    const appliedStartDate = signal<Date>(new Date());
    const appliedEndDate = signal<Date>(new Date());

    // Computed: whether unapplied filters are at their default values
    const isUnappliedFilterDefault = computed(() => {
      const today = new Date();
      const start = unappliedStartDate();
      const end = unappliedEndDate();
      return unappliedProcessedBy().length === 0
        && start.toDateString() === today.toDateString()
        && end.toDateString() === today.toDateString();
    });

    // Computed: whether applied filters are at their default values
    const isAppliedFilterDefault = computed(() => {
      const today = new Date();
      const start = appliedStartDate();
      const end = appliedEndDate();
      return appliedProcessedBy().length === 0
        && start.toDateString() === today.toDateString()
        && end.toDateString() === today.toDateString();
    });

    // Computed: whether unapplied filters differ from applied filters (to enable APPLY button)
    const hasUnappliedChanges = computed(() => {
      const processedByChanged = JSON.stringify(unappliedProcessedBy()) !== JSON.stringify(appliedProcessedBy());
      const startDateChanged = unappliedStartDate().toDateString() !== appliedStartDate().toDateString();
      const endDateChanged = unappliedEndDate().toDateString() !== appliedEndDate().toDateString();

      return processedByChanged || startDateChanged || endDateChanged;
    });

    // Apply filters - copies unapplied to applied
    const applyFilters = () => {
      appliedProcessedBy.set(unappliedProcessedBy());
      appliedStartDate.set(unappliedStartDate());
      appliedEndDate.set(unappliedEndDate());
    };

    // Clear filters - resets both unapplied and applied to defaults
    const clearFilters = () => {
      const defaults = this.getDefaultCompletedFilters();
      unappliedProcessedBy.set(defaults.processedBy);
      unappliedStartDate.set(defaults.startDate);
      unappliedEndDate.set(defaults.endDate);
      applyFilters();
    };

    return {
      // Unapplied signals
      unappliedProcessedBy,
      unappliedStartDate,
      unappliedEndDate,
      // Applied signals
      appliedProcessedBy,
      appliedStartDate,
      appliedEndDate,
      // Computed
      isUnappliedFilterDefault,
      isAppliedFilterDefault,
      hasUnappliedChanges,
      // Methods
      applyFilters,
      clearFilters
    };
  }
}
