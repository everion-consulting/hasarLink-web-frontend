import React from 'react'
import '../../styles/stepper.css';
const Stepper = ({ steps, currentStep, onStepPress }) => {
  return (
    <div className="stepper-container">
      <div className="step-row">
        {steps.map((label, index) => {
          const stepIndex = index + 1;
          const isActive = stepIndex === currentStep;
          const isCompleted = stepIndex < currentStep;

          return (
            <React.Fragment key={index}>
              {/* Circle */}
              <div className="circle-container">
                <button
                  onClick={() => onStepPress(stepIndex)}
                  className="step-button"
                  type="button"
                >
                  <div className={`step-circle ${isActive || isCompleted ? 'active' : ''}`}>
                    <span className={`step-number ${isActive || isCompleted ? 'active' : ''}`}>
                      {stepIndex}
                    </span>
                  </div>
                </button>

                {/* Label: her kelime ayrı satır */}
                <div className="step-label">
                  {label.split(/\s+/).map((word, i) => (
                    <div key={i}>{word}</div>
                  ))}
                </div>
              </div>

              {/* Çizgi */}
              {index < steps.length - 1 && <div className="line-between" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;