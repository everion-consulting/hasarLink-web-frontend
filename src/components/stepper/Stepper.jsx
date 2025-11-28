import React from 'react';
import styles from '../../styles/stepper.module.css';

const Stepper = ({ steps, currentStep, onStepPress }) => {
  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepRow}>
        {steps.map((label, index) => {
          const stepIndex = index + 1;
          const isActive = stepIndex === currentStep;
          const isCompleted = stepIndex < currentStep;

          return (
            <React.Fragment key={index}>
              {/* Circle */}
              <div className={styles.circleContainer}>
                <button
                  onClick={() => onStepPress(stepIndex)}
                  className={styles.stepButton}
                  type="button"
                >
                  <div
                    className={`${styles.stepCircle} ${isActive || isCompleted ? styles.active : ''
                      }`}
                  >
                    <span
                      className={`${styles.stepNumber} ${isActive || isCompleted ? styles.active : ''
                        }`}
                    >
                      {stepIndex}
                    </span>
                  </div>
                </button>

                {/* Label */}
                <div className={styles.stepLabel}>
                  {label.split(/\s+/).map((word, i) => (
                    <div key={i}>{word}</div>
                  ))}
                </div>
              </div>

              {/* Çizgi */}
              {index < steps.length - 1 && (
                <div
                  className={`${styles.lineBetween} ${isCompleted ? styles.completed : ''
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;