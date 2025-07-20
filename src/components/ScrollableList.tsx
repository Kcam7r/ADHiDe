import React, { useRef, useState, useEffect, Children, isValidElement } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollableListProps {
  children: React.ReactNode;
  itemHeightPx?: number; // Rzeczywista wysokość pojedynczego elementu (np. 44px dla nawyków)
  itemMarginYPx?: number; // Pionowy margines między elementami (np. 12px dla space-y-3)
  containerPaddingTopPx?: number; // Padding na górze wewnętrznego kontenera przewijania (np. 8px dla pt-2)
  visibleItemsCount?: number; // Maksymalna liczba widocznych elementów (teraz tylko do określenia, kiedy pokazać strzałki)
  emptyMessage?: string; // Wiadomość wyświetlana, gdy lista jest pusta
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

export const ScrollableList: React.FC<ScrollableListProps> = ({
  children,
  itemHeightPx = 44,
  itemMarginYPx = 12,
  containerPaddingTopPx = 8,
  visibleItemsCount = 10, // Domyślna wartość, jeśli nie zostanie przekazana
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
    let resizeObserver: ResizeObserver;

    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollability);
      resizeObserver = new ResizeObserver(() => {
        setTimeout(checkScrollability, 50);
      });
      resizeObserver.observe(currentRef);
      window.addEventListener('resize', checkScrollability); 

      setTimeout(checkScrollability, 50);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollability);
        if (resizeObserver) {
          resizeObserver.disconnect(); 
        }
        window.removeEventListener('resize', checkScrollability);
      }
    };
  }, [items.length, children, itemHeightPx, itemMarginYPx, containerPaddingTopPx, visibleItemsCount]); 

  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const scrollAmount = itemHeightPx + itemMarginYPx; 
      scrollContainerRef.current.scrollBy({
        top: direction === 'down' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Oblicz maksymalną wysokość na podstawie liczby widocznych elementów
  const calculatedMaxHeight = 
    (visibleItemsCount * itemHeightPx) + 
    ((visibleItemsCount > 0 ? visibleItemsCount - 1 : 0) * itemMarginYPx) + 
    containerPaddingTopPx;

  // Strzałki pojawiają się, jeśli jest więcej elementów niż może się zmieścić
  const showArrows = items.length > visibleItemsCount;

  if (items.length === 0) {
    return (
      <div className="text-gray-400 text-center flex-1 flex items-center justify-center">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ maxHeight: `${calculatedMaxHeight}px` }}>
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
        style={{ 
          scrollSnapType: 'y mandatory',
        }}
      >
        <div className="space-y-3 pt-2">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <motion.div
                key={item.key || index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                style={{ scrollSnapAlign: 'start' }}
              >
                {item}
              </motion.div>
            ))}
          </AnimatePresence>
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