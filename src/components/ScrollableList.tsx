import React, { useRef, useState, useEffect, Children, isValidElement } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

interface ScrollableListProps {
  children: React.ReactNode;
  itemHeightPx?: number; // Rzeczywista wysokość pojedynczego elementu (np. 44px dla nawyków)
  itemMarginYPx?: number; // Pionowy margines między elementami (np. 12px dla space-y-3)
  containerPaddingTopPx?: number; // Padding na górze wewnętrznego kontenera przewijania (np. 8px dla pt-2)
  visibleItemsCount?: number; // Maksymalna liczba widocznych elementów
  emptyMessage?: string; // Wiadomość wyświetlana, gdy lista jest pusta
}

// Define common animation variants for list items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

export const ScrollableList: React.FC<ScrollableListProps> = ({
  children,
  itemHeightPx = 44, // Domyślna wysokość elementu (dla nawyków i zadań projektów)
  itemMarginYPx = 12, // Domyślny margines space-y-3
  containerPaddingTopPx = 8, // Domyślny padding pt-2
  visibleItemsCount = 10,
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
      window.addEventListener('resize', checkScrollability);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      }
    };
  }, [items.length, itemHeightPx, itemMarginYPx, containerPaddingTopPx, visibleItemsCount]);

  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const scrollAmount = itemHeightPx + itemMarginYPx; 
      scrollContainerRef.current.scrollBy({
        top: direction === 'down' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const totalHeight = (visibleItemsCount * itemHeightPx) + 
                      ((visibleItemsCount - 1) * itemMarginYPx) + 
                      containerPaddingTopPx;
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
        style={{ maxHeight: `${totalHeight}px`, scrollSnapType: 'y mandatory' }} // Added scrollSnapType
      >
        <div className="space-y-3 pt-2">
          <AnimatePresence initial={false}> {/* initial={false} to prevent initial animation on mount for all items */}
            {items.map((item, index) => (
              <motion.div
                key={item.key || index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileInView="visible" // For on-scroll reveal
                viewport={{ once: true, amount: 0.5 }} // Animate only once when 50% in view
                style={{ scrollSnapAlign: 'start' }} // Added scrollSnapAlign
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