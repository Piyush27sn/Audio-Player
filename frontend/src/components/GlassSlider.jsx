import React, { useRef } from 'react';

export function GlassSlider({ value, min = 0, max = 1, step = 0.01, onChange, style = {}, ...props }) {
  // Calculate percentage for gradient fill
  const percent = ((value - min) / (max - min)) * 100;
  // Gradient: filled (accent), unfilled (dark)
  const sliderStyle = {
    background: `linear-gradient(90deg, var(--accent-2) 0%, var(--accent) ${percent}%, #23293a ${percent}%, #23293a 100%)`,
    ...style,
  };
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="glass-slider no-thumb"
      style={sliderStyle}
      {...props}
    />
  );
}
