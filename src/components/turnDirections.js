/**
 * Turn-by-Turn Directions Component
 * Renders step maneuvers, distances, road names, and interactive step markers
 */

export class TurnDirectionsComponent {
  constructor(containerElement, onStepClick = null) {
    this.container = containerElement;
    this.onStepClick = onStepClick;
    this.steps = [];
  }

  render(steps, routeSummary = '') {
    this.steps = steps || [];
    if (!this.container) return;

    if (this.steps.length === 0) {
      this.container.innerHTML = `
        <div class="empty-directions">
          <p>No turn-by-turn maneuvers available for this route.</p>
        </div>
      `;
      return;
    }

    const html = `
      <div class="directions-header">
        <h4>Turn-by-turn Directions</h4>
        <span class="step-count">${this.steps.length} steps</span>
      </div>
      <div class="directions-list">
        ${this.steps.map((step, idx) => `
          <div class="direction-step" data-index="${idx}" id="dir-step-${idx}">
            <div class="step-icon-col">
              <span class="step-icon">${step.icon || '⬆️'}</span>
              ${idx < this.steps.length - 1 ? '<div class="step-line"></div>' : ''}
            </div>
            <div class="step-content">
              <div class="step-instruction">${step.instruction}</div>
              <div class="step-meta">
                <span class="step-dist">${step.distanceText}</span>
                ${step.roadName && step.roadName !== 'Unnamed Road' ? `<span class="step-road">&bull; ${step.roadName}</span>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.container.innerHTML = html;

    // Attach step click event listeners
    const stepEls = this.container.querySelectorAll('.direction-step');
    stepEls.forEach(el => {
      el.addEventListener('click', () => {
        const index = parseInt(el.getAttribute('data-index'), 10);
        stepEls.forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        if (this.onStepClick && this.steps[index]) {
          this.onStepClick(this.steps[index]);
        }
      });
    });
  }

  highlightStep(index) {
    if (!this.container) return;
    const stepEls = this.container.querySelectorAll('.direction-step');
    stepEls.forEach((el, i) => {
      if (i === index) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        el.classList.remove('active');
      }
    });
  }
}
