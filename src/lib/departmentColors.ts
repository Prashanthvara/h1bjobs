export const DEPARTMENT_COLORS: Record<string, string> = {
  'clinical care': '#E8E5F5',
  'clinical operations': '#D4E9E6',
  'research': '#D9D9EF',
  'operations': '#D8D8DD',
  'operations & administration': '#D8D8DD',
  'facilities': '#F5EED9',
  'education': '#D9E1F5',
  'finance': '#D9EDE0',
  'information technology': '#D9E3F5',
  'engineering': '#F5F0D4',
  'engineering & technology': '#F5F0D4',
  'data': '#F5D9E8',
  'data & analytics': '#F5D9E8',
  'supply chain': '#F0F5D4',
  'supply chain & procurement': '#F0F5D4',
  'student services': '#E2E5F5',
  'communications': '#F5D9E5',
  'communications & marketing': '#F5D9E5',
  'human resources': '#F5E9D4',
  'legal': '#C8CDF5',
  'legal & compliance': '#C8CDF5',
  'advancement': '#F5EFD4',
  'advancement & development': '#F5EFD4',
  'other': '#EAEAEC',
};

export const DEPARTMENT_TEXT_COLORS: Record<string, string> = {
  'clinical care': '#5B21B6',
  'clinical operations': '#115E59',
  'research': '#4338CA',
  'operations': '#4B5563',
  'operations & administration': '#4B5563',
  'facilities': '#92400E',
  'education': '#1D4ED8',
  'finance': '#166534',
  'information technology': '#1D4ED8',
  'engineering': '#A16207',
  'engineering & technology': '#A16207',
  'data': '#9D174D',
  'data & analytics': '#9D174D',
  'supply chain': '#65A30D',
  'supply chain & procurement': '#65A30D',
  'student services': '#1E40AF',
  'communications': '#BE185D',
  'communications & marketing': '#BE185D',
  'human resources': '#C2410C',
  'legal': '#1E3A8A',
  'legal & compliance': '#1E3A8A',
  'advancement': '#A16207',
  'advancement & development': '#A16207',
  'other': '#6B7280',
};

export function getDepartmentColor(department: string): string {
  const key = department.toLowerCase().trim();
  return DEPARTMENT_COLORS[key] || DEPARTMENT_COLORS['other'];
}

export function getDepartmentTextColor(department: string): string {
  const key = department.toLowerCase().trim();
  return DEPARTMENT_TEXT_COLORS[key] || DEPARTMENT_TEXT_COLORS['other'];
}
