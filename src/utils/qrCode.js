import Qrcode from 'qrcode';

export const generateQrCode = async (data = '') =>
  Qrcode.toDataURL(JSON.stringify(data), { errorCorrectionLevel: 'H' });
