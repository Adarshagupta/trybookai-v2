import * as React from "react"

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  className?: string;
}

export function RadioGroup({ options, value, onChange, name, label, className = "" }: RadioGroupProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${name}-${option.value}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={`${name}-${option.value}`} className="font-medium text-gray-700 dark:text-gray-300">
                {option.label}
              </label>
              {option.description && (
                <p className="text-gray-500 dark:text-gray-400">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
