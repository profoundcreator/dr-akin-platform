"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: boolean;
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 24,
  stagger = false,
  ...props
}: RevealProps) {
  if (stagger) {
    return (
      <motion.div
        className={cn(className)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
