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
import type { ComboboxOption, ComboboxGroupedOptions } from "@/components/ui/combobox"

interface MultiComboboxProps {
    options?: ComboboxOption[]
    groupedOptions?: ComboboxGroupedOptions[]
    values: string[]
    onValuesChange: (values: string[]) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
}

export function MultiCombobox({
    options,
    groupedOptions,
    values,
    onValuesChange,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    className,
}: MultiComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const selectedLabels = React.useMemo(() => {
        const labels: string[] = []
        if (options) {
            for (const opt of options) {
                if (values.includes(opt.value)) labels.push(opt.label)
            }
        }
        if (groupedOptions) {
            for (const group of groupedOptions) {
                for (const opt of group.options) {
                    if (values.includes(opt.value)) labels.push(opt.label)
                }
            }
        }
        return labels
    }, [options, groupedOptions, values])

    const triggerLabel = React.useMemo(() => {
        if (selectedLabels.length === 0) return null
        if (selectedLabels.length === 1) return selectedLabels[0]
        return `${selectedLabels[0]}, +${selectedLabels.length - 1} more`
    }, [selectedLabels])

    function toggleValue(val: string) {
        if (values.includes(val)) {
            onValuesChange(values.filter((v) => v !== val))
        } else {
            onValuesChange([...values, val])
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full h-11 justify-start text-left font-normal border-gray-200 shadow-sm",
                        values.length === 0 && "text-gray-500",
                        className
                    )}
                >
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                        <span className="truncate">
                            {triggerLabel ?? placeholder}
                        </span>
                        <div className="ml-2 flex shrink-0 items-center gap-1">
                            {values.length > 0 && (
                                <X
                                    className="h-4 w-4 shrink-0 opacity-50 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onValuesChange([])
                                    }}
                                />
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[200px] max-w-[300px] p-0" align="start">
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
                                                    toggleValue(actualValue)
                                                }}
                                                className="text-xs font-medium text-muted-foreground"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        values.includes(stateOption.value) ? "opacity-100" : "opacity-0"
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
                                                    toggleValue(actualValue)
                                                }}
                                                className="pl-4"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        values.includes(option.value) ? "opacity-100" : "opacity-0"
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
                                            toggleValue(actualValue)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                values.includes(option.value) ? "opacity-100" : "opacity-0"
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
