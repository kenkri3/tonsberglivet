'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Check, X as XIcon, RefreshCw, Mail, Phone } from 'lucide-react';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  startDate?: string;
  endDate?: string;
  message?: string;
  status: string;
  createdAt?: string;
}

export default function TorvleieAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/booking');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/booking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
      }
    } catch (e) {
      console.error('Status update failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Torvleie-forespørsler</h2>
          <p className="text-foreground-muted text-sm mt-1">{bookings.length} registrert i databasen</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2.5 bg-surface-muted hover:bg-border rounded-xl text-foreground-muted transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Oppdater
        </button>
      </div>

      <div className="grid gap-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-surface rounded-2xl border border-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mt-1">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-foreground">{b.name}</h3>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-accent-light text-accent rounded-full uppercase tracking-wider">
                    {b.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted pt-1">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" /> {b.email}</span>
                  {b.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-primary" /> {b.phone}</span>}
                  {b.startDate && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {b.startDate}</span>}
                </div>
                {b.message && (
                  <p className="text-xs text-foreground-muted bg-surface-muted p-2.5 rounded-xl mt-2 italic">
                    «{b.message}»
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  b.status === 'APPROVED' || b.status === 'Godkjent'
                    ? 'bg-success-light text-success'
                    : b.status === 'REJECTED'
                    ? 'bg-error-light text-error'
                    : 'bg-primary-light text-primary'
                }`}
              >
                {b.status === 'APPROVED' ? 'Godkjent' : b.status === 'REJECTED' ? 'Avslått' : 'Ny forespørsel'}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(b.id, 'APPROVED')}
                  className="p-2 rounded-xl bg-success-light text-success hover:bg-success hover:text-white transition-colors"
                  title="Godkjenn forespørsel"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                  className="p-2 rounded-xl bg-error-light text-error hover:bg-error hover:text-white transition-colors"
                  title="Avslå forespørsel"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
