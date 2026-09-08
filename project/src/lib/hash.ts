export async function computeSHA256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return computeSHA256(buffer);
}

export async function verifyFileHash(file: File, expectedHash: string): Promise<boolean> {
  const actualHash = await computeFileHash(file);
  return actualHash === expectedHash;
}
