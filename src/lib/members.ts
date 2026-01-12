// Predefined list of 10 friends
export const MEMBERS = [
  { id: 'monalisa', name: 'Monalisa', color: '#ef4444' },
  { id: 'steffin', name: 'Steffin', color: '#3b82f6' },
  { id: 'kiana', name: 'Kiana', color: '#10b981' },
  { id: 'ira', name: 'Ira', color: '#f59e0b' },
  { id: 'saylee', name: 'Saylee', color: '#8b5cf6' },
  { id: 'manali', name: 'Manali', color: '#ec4899' },
  { id: 'minh_hai', name: 'Minh Hai', color: '#06b6d4' },
  { id: 'zhan_wei', name: 'Zhan Wei', color: '#84cc16' },
  { id: 'ben', name: 'Ben', color: '#f97316' },
  { id: 'shawn', name: 'Shawn', color: '#6366f1' },
] as const

export type Member = typeof MEMBERS[number]
