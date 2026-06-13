import { useEffect, useState } from 'react';
import { paymentService } from '../services/paymentService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ManualPayment = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ appointmentId: '', amount: '', method: 'BANK_TRANSFER', transactionId: '', bank: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data || []);
      } catch (err) {
        console.error('Failed to load appointments', err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('patientId', user?.patient?.id || '');
      if (form.appointmentId) fd.append('appointmentId', form.appointmentId);
      fd.append('amount', form.amount);
      fd.append('method', form.method);
      fd.append('transactionId', form.transactionId);
      fd.append('bank', form.bank);
      if (file) fd.append('screenshot', file);

      const res = await paymentService.createPayment(fd);
      if (res) {
        alert('Payment submitted. Assistant will verify shortly.');
      }
    } catch (err) {
      console.error('Failed to submit payment', err);
      alert('Failed to submit payment');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Manual Payment Submission</h2>
          <Link to="/patient/payments" className="text-sm text-blue-300">Back</Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Appointment (optional)</label>
            <select value={form.appointmentId} onChange={(e) => setForm({...form, appointmentId: e.target.value})} className="w-full bg-white/10 text-white rounded-md px-3 py-2">
              <option value="">Select appointment</option>
              {appointments.map(a => (
                <option key={a.id} value={a.id}>{a.doctor?.fullName} — {new Date(a.date).toLocaleDateString()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Amount</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full bg-white/10 text-white rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Payment Method</label>
            <select value={form.bank} onChange={(e) => setForm({...form, bank: e.target.value})} className="w-full bg-white/10 text-white rounded-md px-3 py-2">
              <option value="">Select channel</option>
              <option value="EASYPAISA">Easypaisa</option>
              <option value="JAZZCASH">JazzCash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Transaction ID</label>
            <input type="text" value={form.transactionId} onChange={(e) => setForm({...form, transactionId: e.target.value})} className="w-full bg-white/10 text-white rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Upload Screenshot / Proof</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full text-white" />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPayment;
