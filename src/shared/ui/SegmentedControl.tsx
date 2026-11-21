import { useId } from 'react';
import fieldStyles from './fields.module.css';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Shown above the options, like a field label. */
  label?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  const labelId = useId();
  return (
    <div className={fieldStyles.field}>
      {label && (
        <span id={labelId} className={fieldStyles.label}>
          {label}
        </span>
      )}
      <div className={styles.group} role="group" aria-labelledby={label ? labelId : undefined}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.option}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
