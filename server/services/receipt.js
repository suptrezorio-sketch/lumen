/**
 * Generate receipt PNG via Pollinations API
 * https://gen.pollinations.ai/image/{prompt}
 */
async function generateReceiptImage({ amount, recipient, txId, date }) {
  const token = process.env.POLLINATIONS_API_KEY;
  if (!token) return null;

  const prompt = encodeURIComponent(
    `Professional bank transfer receipt PNG, white background, black text, minimalist design. ` +
      `Bank name LUMEN BANK. Amount $${amount} CAD. Recipient: ${recipient}. ` +
      `Transaction ID: ${txId}. Date: ${date}. Status: COMPLETED. High contrast, no watermark.`
  );

  const url = `https://gen.pollinations.ai/image/${prompt}?width=600&height=800&model=flux&nologo=true`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    redirect: 'follow',
  });

  if (!res.ok) {
    console.warn('[receipt] Pollinations error', res.status);
    return null;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const base64 = buffer.toString('base64');
  return {
    contentType: res.headers.get('content-type') || 'image/png',
    base64,
    dataUrl: `data:image/png;base64,${base64}`,
  };
}

module.exports = { generateReceiptImage };
