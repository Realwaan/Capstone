import React from 'react';
import { toast } from 'sonner';
import { CheckSquare, Link2, AlertCircle } from 'lucide-react';

/**
 * Modern compact Sonner submission gate notifier.
 * Sleek, lightweight, and informative without bulky boxes.
 */
export const showSubmissionGateToast = (missing: string[]) => {
  const criteriaItem = missing.find(m => m.toLowerCase().includes('acceptance criter'));
  const evidenceItem = missing.find(m => m.toLowerCase().includes('evidence') || m.toLowerCase().includes('deliverable'));
  const otherItems = missing.filter(m => m !== criteriaItem && m !== evidenceItem);

  toast.error('Submission Requirements', {
    description: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
        {criteriaItem && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.77rem',
            color: 'var(--text-secondary)'
          }}>
            <span className="badge badge-warning" style={{ fontSize: '0.58rem', padding: '1px 5px', fontWeight: 800 }}>Criteria</span>
            <span style={{ flex: 1 }}>{criteriaItem}</span>
          </div>
        )}

        {evidenceItem && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.77rem',
            color: 'var(--text-secondary)'
          }}>
            <span className="badge badge-info" style={{ fontSize: '0.58rem', padding: '1px 5px', fontWeight: 800 }}>Evidence</span>
            <span style={{ flex: 1 }}>{evidenceItem}</span>
          </div>
        )}

        {otherItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.77rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span className="badge badge-danger" style={{ fontSize: '0.58rem', padding: '1px 5px', fontWeight: 800 }}>Required</span>
            <span style={{ flex: 1 }}>{item}</span>
          </div>
        ))}
      </div>
    ),
    duration: 4500
  });
};
