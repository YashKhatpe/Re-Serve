import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface FilterPanelProps {
  dateRange: string;
  setDateRange: (range: string) => void;
  selectedNGO: string;
  setSelectedNGO: (ngo: string) => void;
  selectedFoodType: string;
  setSelectedFoodType: (type: string) => void;
}

const FilterPanel = ({
  dateRange,
  setDateRange,
  selectedNGO,
  setSelectedNGO,
  selectedFoodType,
  setSelectedFoodType,
}: FilterPanelProps) => {
  const dateRanges = [
    { value: "7days", label: "Last 7 days" },
    { value: "30days", label: "Last 30 days" },
    { value: "90days", label: "Last 3 months" },
    { value: "year", label: "This year" },
  ];

  const ngos = [
    { value: "all", label: "All NGOs" },
    { value: "hope-foundation", label: "Hope Foundation" },
    { value: "community-kitchen", label: "Community Kitchen" },
    { value: "meal-angels", label: "Meal Angels" },
    { value: "street-support", label: "Street Support" },
  ];

  const foodTypes = [
    { value: "all", label: "All Types" },
    { value: "cooked-food", label: "Cooked Food" },
    { value: "fresh-produce", label: "Fresh Produce" },
    { value: "bakery", label: "Bakery Items" },
    { value: "packaged", label: "Packaged Food" },
  ];

  const activeFiltersCount = [selectedNGO, selectedFoodType].filter(
    (f) => f !== "all"
  ).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date Range Selector */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-gray-300">
            {dateRanges.find((range) => range.value === dateRange)?.label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            {dateRanges.map((range) => (
              <Button
                key={range.value}
                variant={dateRange === range.value ? "default" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => setDateRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Filters Dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-gray-300">
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4">
          <div className="space-y-4">
            {/* NGO Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                NGO Partner
              </label>
              <div className="space-y-1">
                {ngos.map((ngo) => (
                  <Button
                    key={ngo.value}
                    variant={selectedNGO === ngo.value ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedNGO(ngo.value)}
                  >
                    {ngo.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Food Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Food Type
              </label>
              <div className="space-y-1">
                {foodTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={
                      selectedFoodType === type.value ? "default" : "ghost"
                    }
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedFoodType(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  setSelectedNGO("all");
                  setSelectedFoodType("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterPanel;
