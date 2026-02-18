import { Injectable } from '@angular/core';
import { BenchTestDeviceStatusDescription } from 'src/app/shared/data/bench-test/constants';
import { BenchTestDeviceStatus } from 'src/app/shared/data/bench-test/enums';

@Injectable({
    providedIn: 'root',
})
export class BenchTestLoadingColorService {
    getStatusColorClass(status: string): string {
        const statusCode = this.getBenchTestDeviceStatusByDescription(status);
        switch (statusCode) {
            case BenchTestDeviceStatus.Error:
                case BenchTestDeviceStatus.FirmwareError:
                return 'bg-[#E80808FF] [&+div]:text-white';
            case BenchTestDeviceStatus.Completed:
                return 'bg-[#60C447FF]';
            default:
                return 'bg-gray-300';
        }
    }

    private getBenchTestDeviceStatusByDescription(description: string): BenchTestDeviceStatus | undefined {
        for (const [status, desc] of BenchTestDeviceStatusDescription.entries()) {
            if (desc === description) {
                return status;
            }
        }
        return undefined;
    }
}
