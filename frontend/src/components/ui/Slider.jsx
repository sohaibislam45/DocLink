import * as React from "react"
import { cn } from "../../lib/utils"

const Slider = ({ className, defaultValue, max, step, onValueChange, ...props }) => {
  const [min, setMin] = React.useState(defaultValue[0])
  const [maxVal, setMaxVal] = React.useState(defaultValue[1])

  // Sync state when props change (e.g., on reset)
  React.useEffect(() => {
    setMin(defaultValue[0])
    setMaxVal(defaultValue[1])
  }, [defaultValue])

  const handleMinChange = (e) => {
    const val = parseInt(e.target.value) || 0
    setMin(val)
    if (onValueChange) {
      onValueChange([val, maxVal])
    }
  }

  const handleMaxChange = (e) => {
    const val = parseInt(e.target.value) || 0
    setMaxVal(val)
    if (onValueChange) {
      onValueChange([min, val])
    }
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div className="space-y-1.5">
        <label className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Min ($)</label>
        <input
          type="number"
          min={0}
          max={max}
          value={min}
          onChange={handleMinChange}
          className="w-full bg-background-tertiary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary/50 transition-all"
          placeholder="Min"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Max ($)</label>
        <input
          type="number"
          min={0}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="w-full bg-background-tertiary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary/50 transition-all"
          placeholder="Max"
        />
      </div>
    </div>
  )
}

export { Slider }
