export function deriveAwardName(label: string): string {
  const separatorIndex = label.indexOf(' for ');
  if (separatorIndex === -1) return label.trim();
  return label.slice(0, separatorIndex).trim();
}

export function deriveAwardCategory(label: string): string | null {
  const separatorIndex = label.indexOf(' for ');
  if (separatorIndex === -1) return null;
  const category = label.slice(separatorIndex + ' for '.length).trim();
  return category.length > 0 ? category : null;
}
