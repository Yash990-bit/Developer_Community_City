import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target;
      const computedStyle = window.getComputedStyle(target);
      setIsPointer(computedStyle.cursor === 'pointer');
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        transition: 'transform 0.05s ease-out'
      }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isPointer ? (
          // Pointer (Hand-like) Cursor
          <g transform="scale(1.2) translate(-2, -2)">
            <path d="M10 2H14V6H10V2Z" fill="#00ffff" />
            <path d="M8 6H16V10H8V6Z" fill="#00ffff" />
            <path d="M6 10H18V18H6V10Z" fill="#00ffff" />
            <path d="M8 18H16V22H8V18Z" fill="#00ffff" />
            <path d="M10 22H14V30H10V22Z" fill="#00ffff" />
            <rect x="10" y="10" width="4" height="12" fill="white" />
          </g>
        ) : (
          // Crosshair Cursor
          <g opacity={isMouseDown ? 1 : 0.8}>
            {/* Center Dot */}
            <rect x="15" y="15" width="2" height="2" fill="white" />
            
            {/* Vertical lines */}
            <rect x="15" y="4" width="2" height="6" fill="#00ffff" />
            <rect x="15" y="22" width="2" height="6" fill="#00ffff" />
            
            {/* Horizontal lines */}
            <rect x="4" y="15" width="6" height="2" fill="#00ffff" />
            <rect x="22" y="15" width="6" height="2" fill="#00ffff" />
            
            {/* Corners */}
            <path d="M4 4H10V6H6V10H4V4Z" fill="#00ffff" />
            <path d="M22 4H28V10H26V6H22V4Z" fill="#00ffff" />
            <path d="M4 22V28H10V26H6V22H4Z" fill="#00ffff" />
            <path d="M22 26V28H28V22H26V26H22Z" fill="#00ffff" />
            
            {/* Inner highlights */}
            <rect x="15" y="10" width="2" height="2" fill="white" opacity="0.5" />
            <rect x="15" y="20" width="2" height="2" fill="white" opacity="0.5" />
            <rect x="10" y="15" width="2" height="2" fill="white" opacity="0.5" />
            <rect x="20" y="15" width="2" height="2" fill="white" opacity="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
