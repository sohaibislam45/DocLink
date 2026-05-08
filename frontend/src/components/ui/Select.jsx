import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            onClick: () => setIsOpen(!isOpen),
            value: value
          })
        }
        if (child.type === SelectContent && isOpen) {
          return React.cloneElement(child, { 
            onValueChange: (val) => {
              onValueChange(val)
              setIsOpen(false)
            }
          })
        }
        return null
      })}
    </div>
  )
}

const SelectTrigger = ({ className, children, onClick, value }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-xl border border-border bg-background-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
  >
    {React.Children.map(children, (child) => {
      if (child.type === SelectValue) {
        return React.cloneElement(child, { value: value })
      }
      return child
    })}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
)

const SelectValue = ({ placeholder, value }) => (
  <span className="text-text-primary">
    {value || placeholder}
  </span>
)

const SelectContent = ({ className, children, onValueChange }) => (
  <div
    className={cn(
      "absolute top-full z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-background-secondary text-text-primary shadow-xl animate-in fade-in zoom-in-95 duration-200",
      className
    )}
  >
    <div className="p-1">
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { onClick: () => onValueChange(child.props.value) })
      )}
    </div>
  </div>
)

const SelectItem = ({ className, children, value, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 px-3 text-sm outline-none hover:bg-accent-primary/10 hover:text-accent-primary transition-colors",
      className
    )}
  >
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
