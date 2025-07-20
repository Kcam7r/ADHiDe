import React, { useRef, useState, useEffect, Children, isValidElement, useMemo } from 'react';
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
  visibleItemsCount = 5,
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

      setTimeout(checkScrollability, 50); // Initial check after render
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
  }, [items.length, children]); // Dependencies simplified, as height is now flex-based

  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const scrollAmount = itemHeightPx + itemMarginYPx; 
      scrollContainerRef.current.scrollBy({
        top: direction === 'down' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const emptyStateClasses = "text-gray-400 text-center py-4 flex-1 flex items-center justify-center";
  const showArrows = canScrollUp || canScrollDown;

  return (
    <div 
      className="flex flex-col flex-1" // Make the outer div flex-1 to fill parent
    >
      {showArrows && ( // Show up arrow only if can scroll up
        <button
          onClick={() => handleScroll('up')}
          disabled={!canScrollUp} // Disable if cannot scroll up
          className={`p-1 rounded-full self-center mb-2 transition-colors active:scale-[0.98] active:brightness-110
            ${canScrollUp ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 cursor-not-allowed'}
          `}
          title="Przewiń w górę"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
      {items.length === 0 ? (
        <div className={emptyStateClasses}>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto hide-scrollbar" // This is the actual scrollable area
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
      )}
      {showArrows && ( // Show down arrow only if can scroll down
        <button
          onClick={() => handleScroll('down')}
          disabled={!canScrollDown} // Disable if cannot scroll down
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