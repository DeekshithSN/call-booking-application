import { ObserveCallback } from './MetricsContext';
interface MetricsLoggerProps {
    /**
     * If set, it will replace the original logger. Ensure the reference of this value doesn't change between renders by memoizing the logger function or defining it outside the component to avoid performance issues.
     */
    logger?: ObserveCallback;
}
declare const MetricsLogger: ({ logger }: MetricsLoggerProps) => null;
export { MetricsLogger };
