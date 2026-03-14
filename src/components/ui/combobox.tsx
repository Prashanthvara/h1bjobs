"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
    value: string
    label: string
}

export interface ComboboxGroupedOptions {
    label: string
    options: ComboboxOption[]
}

interface ComboboxProps {
    options?: ComboboxOption[]
    groupedOptions?: ComboboxGroupedOptions[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
}

export function Combobox({
    options,
    groupedOptions,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    // Find selected option in either flat or grouped options
    const selectedOption = React.useMemo(() => {
        if (options) {
            return options.find((option) => option.value === value)
        }
        if (groupedOptions) {
            for (const group of groupedOptions) {
                const found = group.options.find((option) => option.value === value)
                if (found) return found
            }
        }
        return undefined
    }, [options, groupedOptions, value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full h-11 justify-start text-left font-normal border-gray-200 shadow-sm",
                        !value && "text-gray-500",
                        className
                    )}
                >
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                        <span className="truncate">
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>

                        <div className="ml-2 flex shrink-0 items-center gap-1">
                            {value && (
                                <X
                                    className="h-4 w-4 shrink-0 opacity-50 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onValueChange?.("")
                                    }}
                                />
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start"> {/* Match button width */}
                <Command
                    filter={(itemValue, search) => {
                        const label = itemValue.split('|')[1] || ''
                        return label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                    }}
                >
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        {groupedOptions ? (
                            groupedOptions.map((group) => {
                                const stateOption = group.options.find((opt) => opt.value.startsWith("state:"))
                                const cityOptions = group.options.filter((opt) => opt.value.startsWith("city:"))
                                return (
                                    <CommandGroup key={group.label}>
                                        {stateOption && (
                                            <CommandItem
                                                key={stateOption.value}
                                                value={`${stateOption.value}|${stateOption.label}`}
                                                onSelect={(currentValue) => {
                                                    const actualValue = currentValue.split('|')[0]
                                                    onValueChange?.(actualValue === value ? "" : actualValue)
                                                    setOpen(false)
                                                }}
                                                className="text-xs font-medium text-muted-foreground"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value === stateOption.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {stateOption.label}
                                            </CommandItem>
                                        )}
                                        {cityOptions.map((option) => (
                                            <CommandItem
                                                key={option.value}
                                                value={`${option.value}|${option.label}`}
                                                onSelect={(currentValue) => {
                                                    const actualValue = currentValue.split('|')[0]
                                                    onValueChange?.(actualValue === value ? "" : actualValue)
                                                    setOpen(false)
                                                }}
                                                className="pl-4"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value === option.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {option.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )
                            })
                        ) : (
                            <CommandGroup>
                                {options?.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={`${option.value}|${option.label}`}
                                        onSelect={(currentValue) => {
                                            const actualValue = currentValue.split('|')[0]
                                            onValueChange?.(actualValue === value ? "" : actualValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}