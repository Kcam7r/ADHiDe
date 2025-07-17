"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { pl } from 'date-fns/locale'; // Importuj polską lokalizację

import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  highlightedDates?: Date[]; // Nowa właściwość dla dat do podświetlenia
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  highlightedDates = [], // Domyślnie pusta tablica
  ...props
}: CalendarProps) {

  // Modyfikatory do zaznaczania dni z wpisami
  const modifiers = {
    highlighted: highlightedDates,
  };

  // Klasy CSS dla zaznaczonych dni
  const modifiersClassNames = {
    highlighted: "bg-blue-700 text-white hover:bg-blue-600", // Styl dla podświetlonych dni
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-full", className)} // Zapewnij pełną szerokość dla głównego kontenera kalendarza
      locale={pl} // Ustaw lokalizację na polską
      weekStartsOn={1} // Ustaw początek tygodnia na poniedziałek (poniedziałek = 1)
      modifiers={modifiers} // Zastosuj niestandardowe modyfikatory
      modifiersClassNames={modifiersClassNames} // Zastosuj niestandardowe klasy dla modyfikatorów
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-gray-300 hover:bg-gray-700 hover:text-white"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full grid grid-cols-7 gap-y-1", // Zastosowanie grid do całej tabeli
        head_row: "contents", // Użycie 'contents' dla wiersza nagłówków
        head_cell:
          "text-gray-400 rounded-md font-normal text-[0.8rem] flex justify-center items-center", // Komórki nagłówków dni tygodnia
        row: "contents", // Użycie 'contents' dla wierszy dat
        cell: "h-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex justify-center items-center", // Komórki dat
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "w-full h-full p-0 font-normal text-gray-300 flex justify-center items-center", // Wypełnienie całej komórki
          "border border-transparent hover:border-gray-600 rounded-md transition-colors duration-100" // Ramki na najechaniu
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-cyan-600 text-white hover:bg-cyan-700 hover:text-white focus:bg-cyan-700 focus:text-white rounded-md shadow-lg",
        day_today: "bg-gray-700 text-white border border-cyan-500 rounded-md",
        day_outside:
          "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-700 aria-selected:text-gray-400 aria-selected:opacity-30",
        day_disabled: "text-gray-600 opacity-50",
        day_range_middle:
          "aria-selected:bg-gray-700 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }