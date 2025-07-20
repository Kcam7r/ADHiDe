import React, { useState, Children, isValidElement } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode;
  itemsPerPage?: number; // Ile elementów ma być widocznych jednocześnie
  className?: string; // Klasa dla głównego kontenera karuzeli
  contentHeightClass?: string; // Klasa dla diva zawierającego widoczne elementy (np. dla wysokości i overflow)
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  itemsPerPage = 4, // Domyślnie 4 elementy widoczne
  className,
  contentHeightClass = "h-[304px]" // Domyślna wysokość dla 4 elementów (ok. 76px na element z marginesem)
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children).filter(isValidElement);
  const totalItems = items.length;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < totalItems;

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(totalItems - itemsPerPage, prev + 1));
  };

  const visibleItems = items.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className={`flex flex-col ${className}`}>
      {totalItems > itemsPerPage && (
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`p-2 rounded-lg text-gray-400 hover:text-white transition-colors active:scale-[0.98] active:brightness-110 ${
            !canGoPrev ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
          } mb-2`}
        >
          <ChevronUp className="w-6 h-6 mx-auto" />
        </button>
      )}
      <div className={`${contentHeightClass} overflow-hidden`}>
        <div className="space-y-3"> {/* To zastosuje odstępy między elementami */}
          {visibleItems.map((item, index) => (
            <React.Fragment key={item.key || index}>
              {item}
            </React.Fragment>
          ))}
        </div>
      </div>
      {totalItems > itemsPerPage && (
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-2 rounded-lg text-gray-400 hover:text-white transition-colors active:scale-[0.98] active:brightness-110 ${
            !canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
          } mt-2`}
        >
          <ChevronDown className="w-6 h-6 mx-auto" />
        </button>
      )}
    </div>
  );
};