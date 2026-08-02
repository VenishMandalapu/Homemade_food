import React from 'react';
import { ShieldCheck, Heart, Leaf, Award } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: <Award size={20} style={{ color: 'var(--accent)' }} />,
      title: "FSSAI Registered",
      desc: "100% compliant home-chef kitchens"
    },
    {
      icon: <ShieldCheck size={20} style={{ color: 'var(--secondary)' }} />,
      title: "Double Sanitized",
      desc: "Hygiene checked & safe storage"
    },
    {
      icon: <Heart size={20} style={{ color: 'var(--primary)' }} />,
      title: "Zero Preservatives",
      desc: "Authentic small-batch recipes"
    },
    {
      icon: <Leaf size={20} style={{ color: '#5bb373' }} />,
      title: "Cold-Pressed Oils",
      desc: "Pure groundnut & sesame oil bases"
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      margin: '24px 0'
    }}>
      {badges.map((badge, idx) => (
        <div key={idx} style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {badge.icon}
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {badge.title}
            </span>
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
            {badge.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
