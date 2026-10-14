"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { easeOut } from "./ease";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SplitText({
  text,
  as: Tag = "h2",
  className,
  play,
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  play?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const shouldPlay = (play ?? true) && inView;
  const words = text.split(" ");

  return (
    <div ref={ref}>
      <Tag aria-label={text} className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="mr-[0.22em] -mt-[0.22em] inline-block overflow-hidden align-bottom pt-[0.22em] pb-[0.12em]"
        >
          <motion.span
            aria-hidden
            className="inline-block"
            initial={{ y: "118%" }}
            animate={shouldPlay ? { y: "0%" } : { y: "118%" }}
            transition={{
              duration: 0.9,
              ease: easeOut,
              delay: delay + index * 0.045,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
      </Tag>
    </div>
  );
}

function ScrollWord({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  const y = useTransform(progress, range, [12, 0]);

  return (
    <motion.span style={{ opacity, y }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

export function ScrollWords({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => {
        const start = index / words.length;
        const end = (index + 1) / words.length;
        return (
          <ScrollWord
            key={`${word}-${index}`}
            progress={scrollYProgress}
            range={[start, end]}
          >
            {word}
          </ScrollWord>
        );
      })}
    </p>
  );
}

export function RevealImage({
  src,
  alt,
  className,
  parallax = false,
  sizes = "100vw",
  priority = false,
  position = "center",
}: {
  src: string;
  alt: string;
  className?: string;
  parallax?: boolean;
  sizes?: string;
  priority?: boolean;
  position?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  // Observe the unclipped wrapper: a fully clipped element never reports as in view.
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div
        className="absolute inset-0 overflow-hidden bg-raised"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={inView ? { clipPath: "inset(0% 0 0 0)" } : undefined}
        transition={{ duration: 1.3, ease: easeOut }}
      >
        <motion.div style={parallax ? { y } : undefined} className="h-full w-full">
          <motion.div
            className="relative h-full w-full"
            initial={{ scale: 1.25 }}
            animate={inView ? { scale: parallax ? 1.16 : 1 } : undefined}
            transition={{ duration: 1.3, ease: easeOut }}
          >
            {/* next/image imported below to keep this file's motion imports grouped */}
            <RevealPhoto
              src={src}
              alt={alt}
              sizes={sizes}
              priority={priority}
              position={position}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function RevealPhoto({
  src,
  alt,
  sizes,
  priority,
  position,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority: boolean;
  position: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="campaign-photo object-cover"
      style={{ objectPosition: position }}
    />
  );
}

export function Pop({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={cn("inline-flex", className)}
      initial={{ scale: 0, rotate: -18 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
    >
      {children}
    </motion.span>
  );
}
