import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerWithButtonProps {
  date: string;
  onChange: (date: string) => void;
  label: string;
  minDate?: string;
}

export function DatePickerWithButton({
  date,
  onChange,
  label,
  minDate
}: DatePickerWithButtonProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const parseDate = (value?: string) => {
    if (!value) return null;
    const [m, d, y] = value.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const formatDate = (date: Date) => {
    const m = (date.getMonth() + 1).toString().padStart(2,"0");
    const d = date.getDate().toString().padStart(2,"0");
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  };

  const selectedDate = parseDate(date);
  const min = parseDate(minDate);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth()+1,
    0
  ).getDate();

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const isDisabled = (day:number) => {
    if (!min) return false;
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return d < min;
  };

  const isSelected = (day:number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day:number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const days = [];

  for(let i=0;i<firstDay;i++){
    days.push(<div key={`empty-${i}`} />);
  }

  for(let day=1;day<=daysInMonth;day++){

    const disabled = isDisabled(day);
    const selected = isSelected(day);
    const todayMark = isToday(day);

    days.push(
      <button
        key={day}
        disabled={disabled}
        onClick={()=>{
          if(disabled) return;
          const d = new Date(currentMonth.getFullYear(),currentMonth.getMonth(),day);
          onChange(formatDate(d));
          setOpen(false);
        }}
        className={`h-8 rounded text-sm flex items-center justify-center
        ${disabled ? "text-gray-300 cursor-not-allowed"
        : selected ? "bg-blue-600 text-white"
        : todayMark ? "border border-blue-500 text-blue-600"
        : "hover:bg-blue-100 text-gray-700"}`}
      >
        {day}
      </button>
    );
  }

  return (
    <div>
      <label className="text-sm text-gray-700 mb-2 block">{label}</label>

      <div className="flex gap-2 items-center">

        <div className="relative flex-1 flex items-center">
          <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
          <input
            value={date}
            onChange={(e)=>onChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm
            focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Calendar className="w-5 h-5"/>
            </button>
          </Popover.Trigger>

          <Popover.Content
            align="end"
            sideOffset={6}
            className="bg-white shadow-xl border rounded-lg p-4 w-72 z-[9999]"
          >

            {/* Header */}
            <div className="flex justify-between items-center mb-4">

              <button
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
              )
            }
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600"/>
          </button>

          <div className="flex gap-2 items-center">

            {/* Month Select */}
            <select
              value={currentMonth.getMonth()}
              onChange={(e) =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), Number(e.target.value), 1)
                )
              }
              className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={currentMonth.getFullYear()}
              onChange={(e) =>
                setCurrentMonth(
                  new Date(Number(e.target.value), currentMonth.getMonth(), 1)
                )
              }
              className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 100 }, (_, i) => today.getFullYear() - 50 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

  </div>

  <button
    onClick={() =>
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
      )
    }
    className="p-1 hover:bg-gray-100 rounded"
  >
    <ChevronRight className="w-5 h-5 text-gray-600"/>
  </button>

            </div>

            {/* Days */}
            <div className="grid grid-cols-7 text-xs text-gray-500 mb-2">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>
                <div key={d} className="text-center">{d}</div>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days}
            </div>

            <button
              onClick={()=>onChange(formatDate(new Date()))}
              className="w-full mt-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Today
            </button>

          </Popover.Content>
        </Popover.Root>

      </div>
    </div>
  );
}