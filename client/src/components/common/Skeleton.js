import React from 'react';
import '../../styles/Common.css';

export const SkeletonLine = ({ w = '100%', h = 14 }) => (
  <div className="skeleton" style={{ width: w, height: h }} />
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton" style={{ height: 160 }} />
    <div style={{ padding: 12 }}>
      <SkeletonLine w="70%" h={18} />
      <div style={{ height: 8 }} />
      <SkeletonLine w="90%" />
      <div style={{ height: 8 }} />
      <SkeletonLine w="40%" />
    </div>
  </div>
);
