import React, { useState, useRef, useEffect, Children, isValidElement } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CylinderCarouselProps {
  children: React.ReactNode;
  itemHeightPx: number; // Wysokość pojedynczego elementu, wliczając padding i marginesy
  className?: string;
}

export const CylinderCarousel: React.FC<CylinderCarouselProps> = ({
  children,
  itemHeightPx,
  className,
}) => {
  const items = Children.toArray(children).filter(isValidElement);
  const numItems = items.length;

  // Jeśli brak elementów, nie renderujemy cylindra
  if (numItems === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <p className="text-gray-400 text-center">Brak nawyków do wyświetlenia</p>
      </div>
    );
  }

  // Obliczanie właściwości cylindra
  // Promień cylindra, tak aby wszystkie elementy zmieściły się na jego obwodzie
  const radius = (itemHeightPx * numItems) / (2 * Math.PI);
  // Kąt obrotu na jeden element
  const anglePerItem = 360 / numItems;

  // Wartości ruchu dla przeciągania
  const dragY = useMotionValue(0); // Śledzi dystans przeciągnięcia w pionie
  const smoothDragY = useSpring(dragY, { stiffness: 300, damping: 30 });

  // Mapowanie dystansu przeciągnięcia na kąt obrotu
  // Jeśli przeciągniemy o itemHeightPx, chcemy obrócić o anglePerItem
  const currentRotation = useTransform(smoothDragY, (val) => {
    return (val / itemHeightPx) * anglePerItem;
  });

  const handleDragEnd = (event: MouseEvent, info: { velocity: { y: number } }) => {
    // Przyciągnij do najbliższej pozycji elementu
    const currentAngle = currentRotation.get();
    const nearestItemAngle = Math.round(currentAngle / anglePerItem) * anglePerItem;
    
    // Konwertuj docelowy kąt z powrotem na dystans dragY
    const targetDragY = (nearestItemAngle / anglePerItem) * itemHeightPx;
    dragY.set(targetDragY);
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ perspective: '1000px', height: `${itemHeightPx * 3}px` }} // Wyświetlaj około 3 elementy naraz
    >
      <motion.div
        className="absolute inset-0 w-full h-full flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          rotateX: currentRotation, // Zastosuj ogólny obrót do cylindra
          transformOrigin: `center center -${radius}px`, // Punkt obrotu dla cylindra
        }}
        drag="y"
        dragConstraints={{ top: -Infinity, bottom: Infinity }} // Pozwól na nieskończone przeciąganie
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        onDrag={(e, info) => {
          dragY.set(dragY.get() + info.delta.y); // Bezpośrednio aktualizuj dragY
        }}
      >
        {items.map((item, index) => {
          const itemAngle = index * anglePerItem;
          return (
            <motion.div
              key={item.key || index}
              className="absolute w-full flex items-center justify-center"
              style={{
                height: itemHeightPx,
                // Pozycjonuj każdy element na cylindrze
                transform: `rotateX(${itemAngle}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden', // Ukryj tylne ściany dla czystszego wyglądu
              }}
            >
              {item}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};