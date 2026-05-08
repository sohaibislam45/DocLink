import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const DropdownContext = createContext(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a DropdownMenu");
  }
  return context;
};

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left" ref={containerRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = ({ children, className, ...props }) => {
  const { open, setOpen } = useDropdown();
  
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuContent = ({ children, className, align = "right" }) => {
  const { open } = useDropdown();
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] rounded-2xl bg-background-secondary border border-border p-2 shadow-2xl overflow-hidden",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DropdownMenuItem = ({ children, onClick, className, variant = "default" }) => {
  const { setOpen } = useDropdown();
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
    setOpen(false);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
        variant === "danger" 
          ? "text-danger hover:bg-danger/10" 
          : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary",
        className
      )}
    >
      {children}
    </button>
  );
};

const DropdownMenuSeparator = () => (
  <div className="h-px bg-border/50 my-1" />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
};
