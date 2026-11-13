import { useEffect, useRef, useState } from 'react';
import type { City } from '@/types/city';

type CityAutocompleteProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  city: City | null;
  onChange: (value: string, city: City | null) => void;
};

export default function CityAutocomplete({
  id,
  label,
  placeholder,
  value,
  city,
  onChange,
}: CityAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [status, setStatus] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const sequence = useRef(0);
  const open = focused && cities.length > 0;
  const hint = focused && !city && value.trim().length < 3 ? 'Type at least 3 characters.' : '';
  const statusMessage = city ? 'City selected.' : status || hint;
  const showStatus = !city && !open && Boolean(statusMessage);

  useEffect(() => {
    if (!focused || city || value.trim().length < 3) return;

    const controller = new AbortController();
    const current = ++sequence.current;
    const timer = setTimeout(async () => {
      if (controller.signal.aborted || current !== sequence.current) return;
      setStatus('Searching cities…');
      try {
        const response = await fetch(`/api/cities?text=${encodeURIComponent(value.trim())}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const data = await response.json();
        if (controller.signal.aborted || current !== sequence.current) return;
        if (!response.ok) {
          setCities([]);
          setStatus(
            typeof data.error === 'string' ? data.error : 'City search failed. Please try again.',
          );
          return;
        }
        if (!Array.isArray(data.cities)) throw new Error('City search failed. Please try again.');
        setCities(data.cities);
        setActiveIndex(-1);
        setStatus(
          data.cities.length
            ? `${data.cities.length} cities found. Use arrow keys to choose.`
            : 'No cities found. Try another name.',
        );
      } catch {
        if (controller.signal.aborted || current !== sequence.current) return;
        setCities([]);
        setStatus('City search failed. Please try again.');
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, city, focused]);

  function dismiss() {
    // Invalidate immediately, including before React runs the effect cleanup.
    sequence.current++;
    setCities([]);
    setActiveIndex(-1);
    setStatus('');
  }

  function select(selected: City) {
    dismiss();
    onChange(selected.label, selected);
  }

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          aria-describedby={`${id}-status`}
          autoComplete="off"
          maxLength={120}
          placeholder={placeholder}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            dismiss();
          }}
          onChange={(event) => {
            dismiss();
            onChange(event.target.value, null);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === 'Escape') {
              event.preventDefault();
              dismiss();
            }
            if (!open) return;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              const next =
                event.key === 'ArrowDown'
                  ? (activeIndex + 1) % cities.length
                  : activeIndex <= 0
                    ? cities.length - 1
                    : activeIndex - 1;
              setActiveIndex(next);
            }
            if (event.key === 'Enter' && activeIndex >= 0) {
              event.preventDefault();
              select(cities[activeIndex]);
            }
          }}
          className="w-full rounded-lg border border-slate-300 p-2 transition focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          aria-label={`${label} cities`}
          hidden={!open}
          className="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg"
        >
          {cities.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(suggestion)}
              className={`cursor-pointer px-3 py-2 text-sm ${index === activeIndex ? 'bg-indigo-50 text-indigo-800' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      </div>
      <p
        id={`${id}-status`}
        role="status"
        aria-atomic="true"
        className={showStatus ? 'mt-1 text-xs text-slate-600' : 'sr-only'}
      >
        {statusMessage}
      </p>
    </div>
  );
}
