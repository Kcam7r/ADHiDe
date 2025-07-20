import React, { useRef, useState, useEffect, Children, isValidElement } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScrollableListProps {
  children: React.ReactNode;
  itemHeightPx?: number; // Oczekiwana wysokość pojedynczego elementu w pikselach
  visibleItemsCount?: number; // Maksymalna liczba widocznych elementów
  emptyMessage?: string; // Wiadomość wyświetlana, gdy lista jest pusta
}

export const ScrollableList: React.FC<ScrollableListProps> = ({
  children,
  itemHeightPx = 56, // Domyślna wysokość kafelka nawyku (p-3 + space-y-3)
  visibleItemsCount = 10, // Domyślnie 10 widocznych elementów
  emptyMessage = 'Brak elementów do wyświetlenia',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children).filter(isValidElement);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight);
    }
  };

  useEffect(() => {
    checkScrollability();
    const currentRef = scrollContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollability);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollability);
      }
    };
  }, [items.length]); // Sprawdzaj przewijalność, gdy zmienia się liczba elementów

  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const scrollAmount = itemHeightPx; // Przewijaj o wysokość jednego elementu
      scrollContainerRef.current.scrollBy({
        top: direction === 'down' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const totalHeight = visibleItemsCount * itemHeightPx;
  const showArrows = items.length > visibleItemsCount;

  if (items.length === 0) {
    return (
      <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {showArrows && (
        <button
          onClick={() => handleScroll('up')}
          disabled={!canScrollUp}
          className={`p-1 rounded-full self-center mb-2 transition-colors active:scale-[0.98] active:brightness-110
            ${canScrollUp ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 cursor-not-allowed'}
          `}
          title="Przewiń w górę"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto hide-scrollbar"
        style={{ maxHeight: `${totalHeight}px` }} // Ogranicz wysokość kontenera
      >
        <div className="space-y-3 pt-2">
          {items.map((item, index) => (
            <React.Fragment key={item.key || index}>
              {item}
            </React.Fragment>
          ))}
        </div>
      </div>
      {showArrows && (
        <button
          onClick={() => handleScroll('down')}
          disabled={!canScrollDown}
          className={`p-1 rounded-full self-center mt-2 transition-colors active:scale-[0.98] active:brightness-110
            ${canScrollDown ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 cursor-not-allowed'}
          `}
          title="Przewiń w dół"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};