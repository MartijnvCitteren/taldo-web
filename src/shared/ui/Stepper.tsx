import { Check } from 'lucide-react';
import styles from './Stepper.module.css';

export interface StepperStep {
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
  isReachable?: (index: number) => boolean;
}

/**
 * The steps of a flow on one page, as a segmented bar like the sign-up `ProgressRail`, but
 * with the names visible and each reached step clickable.
 */
export function Stepper({ steps, currentIndex, onStepClick, isReachable }: StepperProps) {
  return (
    <ol className={styles.list}>
      {steps.map((step, index) => {
        const status = index === currentIndex ? 'active' : index < currentIndex ? 'done' : 'inactive';
        const reachable = isReachable ? isReachable(index) : true;
        return (
          <li key={step.label} className={styles.item} data-status={status}>
            <button
              type="button"
              className={styles.itemButton}
              disabled={!reachable}
              aria-current={status === 'active' ? 'step' : undefined}
              onClick={() => onStepClick?.(index)}
            >
              <span className={styles.marker}>
                {status === 'done' ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : index + 1}
              </span>
              <span className={styles.label}>{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
