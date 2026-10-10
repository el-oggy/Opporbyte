import styles from "./hero3d.module.css";
export default function StaticHero() {
  return (
    <div className={styles.staticWorld}>
      <div className={styles.orbit} />
      <div className={styles.core}>
        <i />
      </div>
      <div className={`${styles.paper} ${styles.job}`}>
        <small>ASTER STUDIO · DEMO</small>
        <strong>Product Designer</strong>
        <span>Design / Remote</span>
        <b>Opportunity →</b>
      </div>
      <div className={`${styles.paper} ${styles.health}`}>
        <small>BLOOM HEALTH · DEMO</small>
        <strong>Care Coordinator</strong>
        <span>Healthcare / Hybrid</span>
      </div>
      <div className={`${styles.paper} ${styles.resume}`}>
        <small>YOUR NEXT CHAPTER</small>
        <strong>
          Experience,
          <br />
          with purpose.
        </strong>
        <i />
        <i />
        <i />
        <b>Verified skills</b>
        <span>Illustrative resume</span>
      </div>
      <div className={`${styles.chip} ${styles.match}`}>✳ Matched</div>
      <div className={`${styles.chip} ${styles.review}`}>Review needed ↗</div>
      <div className={styles.floor} />
    </div>
  );
}
