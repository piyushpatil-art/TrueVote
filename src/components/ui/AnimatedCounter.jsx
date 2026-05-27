import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedCounter({ value, duration = 1.2, className = '' }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());
  const [text, setText] = useState('0');

  useEffect(() => {
    spring.set(Number(value) || 0);
  }, [value, spring]);

  useEffect(() => {
    return display.on('change', (v) => setText(v));
  }, [display]);

  return (
    <motion.span className={className} key={value}>
      {text}
    </motion.span>
  );
}
