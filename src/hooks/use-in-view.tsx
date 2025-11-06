
'use client';

import { useState, useEffect, RefObject } from 'react';

type Options = IntersectionObserverInit & {
  once?: boolean;
};

export function useInView(ref: RefObject<Element>, options: Options = {}): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (options.once) {
          observer.disconnect();
        }
      } else {
        if (!options.once) {
          setIsInView(false);
        }
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isInView;
}
