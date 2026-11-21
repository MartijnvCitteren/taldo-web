import type { ReactNode } from 'react';
import styles from './CardFooter.module.css';

/** A card's actions, below a hairline and aligned right. Give a secondary action `margin-right: auto` to put it on the left. */
export function CardFooter({ children }: { children: ReactNode }) {
  return <div className={styles.footer}>{children}</div>;
}
