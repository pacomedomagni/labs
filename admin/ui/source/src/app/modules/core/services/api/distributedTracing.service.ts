import { Injectable } from "@angular/core";
import { trace, context, SpanContext } from "@opentelemetry/api";

export interface SpanContextInfo {
  traceId: string;
  spanId: string;
}
@Injectable({ providedIn: "root" })
export class DistributedTracingService {
  get spanContext(): SpanContextInfo | null {
    try {
      const activeSpan = trace.getActiveSpan();
      if (activeSpan) {
        const spanContext = activeSpan.spanContext();
        return {
          traceId: spanContext.traceId,
          spanId: spanContext.spanId
        };
      }
      // Fallback: get span context from current context
      const currentContext = context.active();
      const spanContext = trace.getSpanContext(currentContext);
      if (spanContext) {
        return {
          traceId: spanContext.traceId,
          spanId: spanContext.spanId
        };
      }
      return null;
    } catch (error) {
      console.warn("Failed to get span context:", error);
      return null;
    }
  }

  createSpan(name: string, options?: any) {
    const tracer = trace.getTracer("ubi-ui-admin");
    return tracer.startSpan(name, options);
  }
}