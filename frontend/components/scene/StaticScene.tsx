export function StaticScene() {
  return (
    <div className="static-scene" aria-hidden="true">
      <div className="static-orbit" />
      <div className="static-core">
        <span />
      </div>
      <div className="static-card static-job">
        <span className="static-company">
          a. <b>Aster Studio</b>
        </span>
        <strong>Product Designer</strong>
        <span>Design · Remote</span>
        <small>Fictional opportunity</small>
      </div>
      <div className="static-card static-resume">
        <span>YOUR NEXT CHAPTER</span>
        <strong>
          Experience,
          <br />
          with purpose.
        </strong>
        <i />
        <i />
        <i />
        <small>Demo resume</small>
      </div>
      <div className="static-card static-match">
        <strong>✳ 94%</strong>
        <span>Demo match</span>
      </div>
    </div>
  );
}
