import styles from "./logo.module.css";

export const Logo = () => {
  return (
    <div className={styles.monadLogo}>
      <span className={styles.m}>M</span>
      <span className={styles.oTrack}>
        <span className={styles.o}>
          o<span aria-hidden="true" className={styles.eye} />
        </span>
      </span>
      <span className={styles.tailWrap}>
        <span className={styles.tail}>nad</span>
      </span>
    </div>
  );
};
