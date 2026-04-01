"use client";

import { useState, useTransition } from "react";
import { setWaterCount, setFruitCount } from "./actions/tracker-actions";

type TrackerData = {
  waterCount: number;
  fruitCount: number;
};

export function DailyTracker({ initial }: { initial: TrackerData }) {
  const [water, setWater] = useState(initial.waterCount);
  const [fruit, setFruit] = useState(initial.fruitCount);
  const [isPending, startTransition] = useTransition();

  function handleWater(idx: number) {
    const next = water === idx + 1 ? idx : idx + 1;
    setWater(next);
    startTransition(async () => {
      await setWaterCount(next);
    });
  }

  function handleFruit(idx: number) {
    const next = fruit === idx + 1 ? idx : idx + 1;
    setFruit(next);
    startTransition(async () => {
      await setFruitCount(next);
    });
  }

  return (
    <div className="tracker-section">
      <div className="tracker-divider" />

      {/* Water tracker */}
      <div className="tracker-row">
        <span className="tracker-label">water</span>
        <div className="tracker-items">
          {Array.from({ length: 6 }).map((_, i) => (
            <button
              key={`water-${i}`}
              className={`tracker-drop ${i < water ? "filled" : ""}`}
              onClick={() => handleWater(i)}
              aria-label={`${i + 1} pint${i > 0 ? "s" : ""}`}
            >
              <svg viewBox="0 0 24 32" className="drop-svg">
                <path
                  d="M12 2 C12 2 4 14 4 20 C4 25.5 7.6 29 12 29 C16.4 29 20 25.5 20 20 C20 14 12 2 12 2Z"
                  className="drop-path"
                />
              </svg>
            </button>
          ))}
        </div>
        <span className="tracker-count">{water}/6</span>
      </div>

      {/* Fruit & veg tracker */}
      <div className="tracker-row">
        <span className="tracker-label">fruit &amp; veg</span>
        <div className="tracker-items">
          {Array.from({ length: 7 }).map((_, i) => (
            <button
              key={`fruit-${i}`}
              className={`tracker-fruit ${i < fruit ? "filled" : ""}`}
              onClick={() => handleFruit(i)}
              aria-label={`${i + 1} portion${i > 0 ? "s" : ""}`}
            >
              <svg viewBox="0 0 28 28" className="fruit-svg">
                {/* Leaf stem */}
                <path
                  d="M14 4 C14 4 12 7 14 9"
                  className="fruit-stem"
                />
                {/* Small leaf */}
                <path
                  d="M14 6 C16 4 19 5 17 7 C15 8 14 7 14 6Z"
                  className="fruit-leaf"
                />
                {/* Apple body */}
                <path
                  d="M8 12 C5 12 3 16 4 19 C5 23 8 25 11 25 C12.5 25 13.5 24 14 23.5 C14.5 24 15.5 25 17 25 C20 25 23 23 24 19 C25 16 23 12 20 12 C18 12 16 13 14 14.5 C12 13 10 12 8 12Z"
                  className="fruit-body"
                />
              </svg>
            </button>
          ))}
        </div>
        <span className="tracker-count">{fruit}/7</span>
      </div>

      {water >= 6 && fruit >= 7 && (
        <div className="tracker-complete">all done today!</div>
      )}
    </div>
  );
}
