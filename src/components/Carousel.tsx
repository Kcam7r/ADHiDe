import React, { useState, Children, isValidElement, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  const totalItems = items.length;
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'up' | 'down') => {
    if (contentRef.current) {
      const scrollAmount = itemHeightPx; // Przewiń o wysokość jednego elementu
      if (direction === 'up') {
        contentRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      } else {
        contentRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Określ, czy przyciski przewijania powinny być aktywne
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScrollability = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight);
    }
  };

  useEffect(() => {
    const currentContentRef = contentRef.current;
    if (currentContentRef) {
      currentContentRef.addEventListener('scroll', checkScrollability);
      // Początkowe sprawdzenie
      checkScrollability();
    }
    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('scroll', checkScrollability);
      }
    };
  }, [items.length]); // Ponowne sprawdzenie, gdy zmienią się elementy

  return (
    <div className={`flex flex-col h-full ${className}`}> {/* Spraw, aby karuzela zajmowała pełną wysokość i była kolumną flex */}
      {totalItems > 0 && ( // Pokaż przyciski tylko, jeśli są elementy
        <button
          onClick={() => handleScroll('up')}
          disabled={!canScrollUp}
          className={`p-2 rounded-lg text-gray-400 hover:text-white transition-colors active:scale-[0.98] active:brightness-110 ${
            !canScrollUp ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
          } mb-2`}
        >
          <ChevronUp className="w-6 h-6 mx-auto" />
        </button>
      )}
      <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0"> {/* Ten div będzie się przewijał */}
        <div className="space-y-3"> {/* To zastosuje odstępy między elementami */}
          {items.map((item, index) => (
            <React.Fragment key={item.key || index}>
              {item}
            </React.Fragment>
          ))}
        </div>
      </div>
      {totalItems > 0 && ( // Pokaż przyciski tylko, jeśli są elementy
        <button
          onClick={() => handleScroll('down')}
          disabled={!canScrollDown}
          className={`p-2 rounded-lg text-gray-400 hover:text-white transition-colors active:scale-[0.98] active:brightness-110 ${
            !canScrollDown ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
          } mt-2`}
        >
          <ChevronDown className="w-6 h-6 mx-auto" />
        </button>
      )}
    </div>
  );
};