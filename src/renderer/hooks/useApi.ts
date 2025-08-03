export async function callApi(fn: (...args: any[]) => Promise<any>, ...args: any[]) {
  try {
    const res = await fn(...args);
    if (!res.success) throw new Error(res.error || 'Erreur inconnue');
    return res.data;
  } catch (e: any) {
    console.error('API error', e);
    throw e;
  }
}
