import { Injectable } from '@angular/core';
import { MessageCode } from '../../data/application/enums';
import { MessageCodeValue } from '../../data/application/constants';

interface MessageEntry {
    key?: string;
    Key?: string;
    value?: unknown;
    Value?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ResourceMessageService {
    getMessageValue(messages: unknown, code: MessageCode): unknown {
        if (!messages) {
            return undefined;
        }

        if (Array.isArray(messages)) {
            const entry = messages.find((item) => {
                const messageEntry = item as MessageEntry;
                const key = this.normalizeMessageKey(messageEntry?.key ?? messageEntry?.Key);
                return key === code;
            });

            if (entry) {
                const messageEntry = entry as MessageEntry;
                return messageEntry.value ?? messageEntry.Value;
            }
        }

        if (this.isRecord(messages)) {
            const dictionary = messages as Record<string, unknown>;
            const candidate = dictionary[code];
            if (candidate !== undefined) {
                return candidate;
            }
        }

        return undefined;
    }

    getString(messages: unknown, code: MessageCode): string | undefined {
        const value = this.getMessageValue(messages, code);
        return typeof value === 'string' ? value : undefined;
    }

    getFirstString(messages: unknown, codes: MessageCode[]): string | undefined {
        for (const code of codes) {
            const candidate = this.getString(messages, code);
            if (candidate !== undefined) {
                return candidate;
            }
        }

        return undefined;
    }

    private normalizeMessageKey(key: unknown): MessageCode | undefined {
        if (typeof key === 'string') {
            return key as MessageCode;
        }

        if (typeof key === 'number') {
            for (const [messageCode, value] of MessageCodeValue.entries()) {
                if (value === key) {
                    return messageCode;
                }
            }
        }

        return undefined;
    }

    private isRecord(candidate: unknown): candidate is Record<string, unknown> {
        return candidate !== null && typeof candidate === 'object' && !Array.isArray(candidate);
    }
}
