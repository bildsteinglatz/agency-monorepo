'use client';

import React, { useState } from 'react';

export function ConversationHistory() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const conversationExcerpt = `
User: Can you please implement a ThemeSwitch component with a color wheel that animates smoothly when hovered? I want it to spin faster on hover and then gradually slow down over 10 seconds when the mouse leaves.

GitHub Copilot: I'll create a ThemeSwitch component with a smooth color wheel animation. The key to achieving a gradual 10-second slowdown is to use requestAnimationFrame with small incremental speed changes rather than relying on CSS transitions.

Here's the implementation approach:
1. Use SVG for the color wheel with four quadrants (black, white, blue, and rainbow)
2. Implement continuous rotation using requestAnimationFrame
3. Speed up instantly on hover
4. Use a 10-second deceleration algorithm that preserves the exact wheel position
5. Make the slowdown imperceptible by changing speed in tiny 1% increments

The most important part is the deceleration function:

\`\`\`typescript
const performGradualDeceleration = () => {
  // Get current rotation angle
  const currentAngle = extractRotationAngle(currentTransform);
  
  // Calculate a very small increment (1%) for extremely smooth deceleration
  let nextSpeed = currentSpeed * 0.99 + targetSpeed * 0.01;
  
  // Update the wheel animation with the new speed while preserving position
  wheelStateRef.current.speed = nextSpeed;
  wheelStateRef.current.startAngle = currentAngle;
  wheelStateRef.current.startTime = performance.now();
  
  // Continue the deceleration process until target speed is reached
  if (Math.abs(nextSpeed - targetSpeed) > 0.01) {
    slowdownTimeoutRef.current = setTimeout(performGradualDeceleration, 100);
  }
}
\`\`\`

User: The animation is great, but there's a problem - when the wheel slows down, it sometimes turns back a bit, making the animation jumpy. Can you fix this?

GitHub Copilot: That jumping behavior happens when we don't properly preserve the current position and velocity during the deceleration. Let me fix that by improving how we track the wheel's position.

The key improvements:
1. Extract the exact rotation angle from the transform matrix more reliably
2. Preserve that exact angle when changing speeds
3. Make sure we don't reset the position during deceleration
4. Use even smaller, more frequent updates to ensure ultra-smooth transitions

I've added this function to better extract the current angle:

\`\`\`typescript
const extractRotationAngle = (transformStr: string): number => {
  if (!transformStr || transformStr === 'none') return 0;
  
  // Try to match a direct rotate() transform first
  const rotateMatch = transformStr.match(/rotate\\(([0-9.-]+)deg\\)/);
  if (rotateMatch && rotateMatch[1]) {
    return parseFloat(rotateMatch[1]);
  }
  
  // Fall back to matrix extraction if needed
  const matrixMatch = transformStr.match(/matrix\\((.*?)\\)/);
  if (!matrixMatch || !matrixMatch[1]) return 0;
  
  const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
  
  // Calculate angle from matrix values
  let angle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
  if (angle < 0) angle += 360; // Normalize to 0-360
  
  return angle;
};
\`\`\`

User: Can you create an interactive demo page that explains how the animation works? I want to be able to adjust the parameters and see the effect.

GitHub Copilot: I'll create a comprehensive demo page with interactive controls and detailed explanations. The demo will allow you to experiment with different parameters and see how they affect the animation.
`;

  const fullConversation = `
User: Can you please implement a ThemeSwitch component with a color wheel that animates smoothly when hovered? I want it to spin faster on hover and then gradually slow down over 10 seconds when the mouse leaves.

GitHub Copilot: I'll create a ThemeSwitch component with a smooth color wheel animation. The key to achieving a gradual 10-second slowdown is to use requestAnimationFrame with small incremental speed changes rather than relying on CSS transitions.

Here's the implementation approach:
1. Use SVG for the color wheel with four quadrants (black, white, blue, and rainbow)
2. Implement continuous rotation using requestAnimationFrame
3. Speed up instantly on hover
4. Use a 10-second deceleration algorithm that preserves the exact wheel position
5. Make the slowdown imperceptible by changing speed in tiny 1% increments

The most important part is the deceleration function:

\`\`\`typescript
const performGradualDeceleration = () => {
  // Get current rotation angle
  const currentAngle = extractRotationAngle(currentTransform);
  
  // Calculate a very small increment (1%) for extremely smooth deceleration
  let nextSpeed = currentSpeed * 0.99 + targetSpeed * 0.01;
  
  // Update the wheel animation with the new speed while preserving position
  wheelStateRef.current.speed = nextSpeed;
  wheelStateRef.current.startAngle = currentAngle;
  wheelStateRef.current.startTime = performance.now();
  
  // Continue the deceleration process until target speed is reached
  if (Math.abs(nextSpeed - targetSpeed) > 0.01) {
    slowdownTimeoutRef.current = setTimeout(performGradualDeceleration, 100);
  }
}
\`\`\`

User: The animation is great, but there's a problem - when the wheel slows down, it sometimes turns back a bit, making the animation jumpy. Can you fix this?

GitHub Copilot: That jumping behavior happens when we don't properly preserve the current position and velocity during the deceleration. Let me fix that by improving how we track the wheel's position.

The key improvements:
1. Extract the exact rotation angle from the transform matrix more reliably
2. Preserve that exact angle when changing speeds
3. Make sure we don't reset the position during deceleration
4. Use even smaller, more frequent updates to ensure ultra-smooth transitions

I've added this function to better extract the current angle:

\`\`\`typescript
const extractRotationAngle = (transformStr: string): number => {
  if (!transformStr || transformStr === 'none') return 0;
  
  // Try to match a direct rotate() transform first
  const rotateMatch = transformStr.match(/rotate\\(([0-9.-]+)deg\\)/);
  if (rotateMatch && rotateMatch[1]) {
    return parseFloat(rotateMatch[1]);
  }
  
  // Fall back to matrix extraction if needed
  const matrixMatch = transformStr.match(/matrix\\((.*?)\\)/);
  if (!matrixMatch || !matrixMatch[1]) return 0;
  
  const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
  
  // Calculate angle from matrix values
  let angle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
  if (angle < 0) angle += 360; // Normalize to 0-360
  
  return angle;
};
\`\`\`

User: Can you create an interactive demo page that explains how the animation works? I want to be able to adjust the parameters and see the effect.

GitHub Copilot: I'll create a comprehensive demo page with interactive controls and detailed explanations. The demo will allow you to experiment with different parameters and see how they affect the animation.

User: Great! Also, can you make the wheel automatically reset to 0 degrees (initial position) when it finishes slowing down? That would make it more predictable.

GitHub Copilot: Yes, I can implement that feature. The key is to calculate how much time is needed to reach 0 degrees based on the current position and speed.

I'll add a function that:
1. Calculates the remaining angle to reach 0/360 degrees
2. Determines how long it would take to rotate that angle at the current speed
3. Adjusts the animation timing so it reaches 0 degrees exactly when completing a rotation

Here's the implementation:

\`\`\`typescript
// Calculate how to adjust timing to reach 0 degrees
const calculateRotationToZero = (currentAngle: number, speed: number) => {
  // Calculate remaining angle to complete rotation
  const remainingAngle = (360 - currentAngle) % 360;
  
  // Calculate time needed to rotate the remaining angle
  const timeToReachZero = (remainingAngle / 360) * speed * 1000;
  
  // Adjust start time to reach 0 degrees precisely
  wheelStateRef.current.startTime = performance.now() - (speed * 1000 - timeToReachZero);
};

// In the deceleration completion code:
if (decelProgress >= 1) {
  wheelStateRef.current.isDecelerating = false;
  
  // Get current angle
  const currentAngleValue = extractRotationAngle(wheelRef.current.style.transform);
  
  // Calculate rotation to reach 0 degrees
  calculateRotationToZero(currentAngleValue, targetSpeed);
}
\`\`\`

User: This animation technique could be useful for other projects. Can you create a standalone color wheel demo that I can showcase on my website?

GitHub Copilot: I'll create a standalone, reusable color wheel component with comprehensive documentation. This will be perfect for showcasing on your website and for reusing in other projects.

The demo will include:
1. A clean, self-contained component with no external dependencies
2. Interactive controls for all animation parameters
3. Real-time stats showing current speed, angle, and state
4. Detailed code explanations
5. Examples of how to implement in different contexts

User: Make a new artwork category and name it "demo" to showcase this.

GitHub Copilot: I've set up a comprehensive demo page for your website. Here's what I've done:

1. Created a new "DEMO" section in your main navigation
2. Built an interactive Color Wheel Demo with controls for all animation parameters
3. Added code explanation tabs showing the implementation
4. Added detailed documentation about the animation technique
5. Styled the page to match your site's aesthetic with proper dark mode support

The development server is now running, so you can visit http://localhost:3000/demo to see the demo page in action.
`;

  return (
    <div>
      <div className="bg-white dark:bg-black p-4 rounded-md border border-gray-200 dark:border-gray-800 overflow-auto">
        {isExpanded ? fullConversation : conversationExcerpt}
      </div>
      <button 
        className="mt-4 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Show Less' : 'Show Full Conversation'}
      </button>
    </div>
  );
}
