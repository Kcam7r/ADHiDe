import React, { useState, Children, isValidElement, useRef, useEffect } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  className?: string; // Klasa dla głównego kontenera karuzeli
  itemHeightPx?: number; // Oczekiwana wysokość pojedynczego elementu do obliczeń przewijania
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  itemHeightPx = 76, // Domyślna wysokość elementu (np. p-4 + space-y-3 daje ok. 76px na element)
}) => {
  const items = Children.toArray(children).filter(isValidElement);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (contentRef.current) {
      setIsDragging(true);
      startY.current = e.clientY;
      startScrollTop.current = contentRef.current.scrollTop;
      contentRef.current.style.cursor = 'grabbing';
      contentRef.current.style.userSelect = 'none'; // Zapobiega zaznaczaniu tekstu podczas przeciągania
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !contentRef.current) return;
    const deltaY = e.clientY - startY.current;
    contentRef.current.scrollTop = startScrollTop.current - deltaY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (contentRef.current) {
      contentRef.current.style.cursor = 'grab';
      contentRef.current.style.userSelect = 'auto';
    }
  };

  useEffect(() => {
    const currentContentRef = contentRef.current;
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className={`${className}`} 
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0 hide-scrollbar">
        <div className="space-y-3"> {/* Usunięto flex-1 flex flex-col */}
          {items.length === 0 ? (
            <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
              <p>Brak nawyków do wyświetlenia</p>
            </div>
          ) : (
            items.map((item, index) => (
              <React.Fragment key={item.key || index}>
                {item}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};