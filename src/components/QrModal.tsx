import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Printer, X, Check } from 'lucide-react';
import { Batch } from '../types';
import { TrustBadge } from './Badge';

interface QrModalProps {
  batch: Batch;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ batch, onClose }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fullUrl = `${window.location.origin}/#/batches/${batch.id}`;

  useEffect(() => {
    QRCode.toDataURL(fullUrl, { width: 300, margin: 2 }, (err, url) => {
      if (!err && url) {
        setDataUrl(url);
      }
    });
  }, [fullUrl]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `buildloop_qr_${batch.id}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base">Material Batch Passport</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable section */}
        <div ref={printRef} className="my-5 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 text-center flex flex-col items-center">
          <div className="mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              BuildLoop AI • Recovery Passport
            </p>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 max-w-xs truncate">
              {batch.title}
            </h4>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <TrustBadge level={batch.trustLevel} />
              <span className="text-[11px] text-stone-500">ID: {batch.id}</span>
            </div>
          </div>

          {dataUrl ? (
            <img src={dataUrl} alt="Batch QR Code" className="w-48 h-48 rounded-lg shadow-sm border border-stone-200 bg-white p-2" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-stone-200 dark:bg-stone-800 rounded-lg text-xs text-stone-500">
              Generating QR…
            </div>
          )}

          <div className="mt-3 text-xs text-stone-600 dark:text-stone-400">
            <p className="font-medium">
              Qty: {batch.quantity} {batch.unit} • ₹{batch.pricePerUnit}/{batch.unit}
            </p>
            <p className="text-[10px] text-stone-500 mt-0.5">{batch.location.address}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold text-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Label</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <QrCode className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link copied!' : 'Copy Batch Passport URL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
