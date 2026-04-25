import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, HardHat, AlertTriangle, Trash2, Waves, MapPin, 
  List, AlertOctagon, Wrench, CheckSquare, RefreshCw, XCircle,
  Play, CheckCircle, Clock, Inbox, PartyPopper, User, CalendarDays,
  UserPlus
} from 'lucide-react';

const statusConfig = {
  open: { color: '#ef4444', label: 'Open' },
  in_progress: { color: '#f59e0b', label: 'In Progress' },
  resolved: { color: '#22c55e', label: 'Resolved' },
};

const getCategoryIcon = (category) => {
  switch(category) {
    case 'Pothole': return <AlertTriangle size={20} strokeWidth={2.5} color="#475569" />;
    case 'Broken Streetlight': return <AlertOctagon size={20} strokeWidth={2.5} color="#475569" />;
    case 'Garbage Dump': return <Trash2 size={20} strokeWidth={2.5} color="#475569" />;
    case 'Open Drain': return <Waves size={20} strokeWidth={2.5} color="#475569" />;
    default: return <MapPin size={20} strokeWidth={2.5} color="#475569" />;
  }
};

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [assigningId, setAssigningId] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState({});

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchComplaints();
    if (user.role === 'officer') fetchWorkers();
  }, []);

  const fetchComplaints = async () => {
    const endpoint = user.role === 'worker'
      ? `${process.env.REACT_APP_API_URL}/complaints/assigned`
      : `${process.env.REACT_APP_API_URL}/complaints`;
    const res = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setComplaints(res.data);
  };

  const fetchWorkers = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/complaints/workers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setWorkers(res.data);
  };

  const assignWorker = async (complaintId) => {
    if (!selectedWorker[complaintId]) return alert('Please select a worker first');
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/complaints/${complaintId}/assign`,
        { worker_id: selectedWorker[complaintId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssigningId(null);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/complaints/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#fafaf8', padding: '96px 24px 32px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header Section */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#666', fontSize: '13px', fontWeight: '600',
              marginBottom: '10px'
            }}>
              {user.role === 'officer' ? <ShieldAlert size={16} /> : <HardHat size={16} />}
              {user.role === 'officer' ? 'Ward Officer Dashboard' : 'Field Worker Dashboard'}
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
              {user.role === 'officer' ? 'Complaint Management' : 'My Assigned Tasks'}
            </h2>
            <p style={{ color: '#555', fontSize: '14px', marginTop: '6px' }}>
              {user.role === 'officer'
                ? 'Overview of civic issues, assignments, and resolution statuses.'
                : 'Review your assignments and update statuses in real-time.'}
            </p>
          </div>
        </div>

        {/* Pastel Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Reports', count: stats.total, icon: <List size={22} color="#1a1a1a" />, bg: '#fefde8' },
            { label: 'Open Issues', count: stats.open, icon: <AlertOctagon size={22} color="#1a1a1a" />, bg: '#fde8e8' },
            { label: 'In Progress', count: stats.in_progress, icon: <Wrench size={22} color="#1a1a1a" />, bg: '#fde8d8' },
            { label: 'Resolved', count: stats.resolved, icon: <CheckSquare size={22} color="#1a1a1a" />, bg: '#e8fdf0' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg,
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '20px', padding: '28px',
              display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{s.label}</span>
                {s.icon}
              </div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#1a1a1a', lineHeight: 1 }}>
                {s.count}
              </div>
            </div>
          ))}
        </div>

        {/* Professional Filter Tabs */}
        <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', gap: '24px' }}>
          {['all', 'open', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              background: 'none', border: 'none',
              padding: '12px 4px',
              borderBottom: filter === s ? '2px solid #0f172a' : '2px solid transparent',
              color: filter === s ? '#0f172a' : '#64748b',
              cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
              marginBottom: '-1px'
            }}>
              {s === 'all' ? 'All Complaints' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Sleek List View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(c => {
            const sc = statusConfig[c.status];
            return (
              <div key={c.id} style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px', padding: '20px',
                display: 'flex', gap: '20px', alignItems: 'flex-start',
                boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                transition: 'all 0.2s'
              }}>
                {/* Minimal Icon Area */}
                <div style={{ 
                  background: '#f1f5f9', width: '40px', height: '40px', 
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getCategoryIcon(c.category)}
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
                        {c.category}
                      </h3>
                      
                      {/* Subtle Metadata Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                          <CalendarDays size={14} />
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                          <MapPin size={14} />
                          {c.address}
                        </div>
                        {c.citizen_name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                            <User size={14} />
                            Reported by {c.citizen_name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dot Indicator for Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.color }} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                        {sc.label}
                      </span>
                    </div>

                  </div>

                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.5, margin: '12px 0' }}>
                    {c.description}
                  </p>

                  {/* Optional Image */}
                  {c.image_url && (
                    <div style={{ marginBottom: '16px' }}>
                      <a href={`${process.env.REACT_APP_API_URL.replace('/api', '')}${c.image_url}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${c.image_url}`}
                          alt="Complaint evidence"
                          style={{ height: '70px', width: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        />
                      </a>
                    </div>
                  )}

                  {/* Action & Assignment Row */}
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '4px' 
                  }}>
                    
                    {/* Left: Assignment Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {c.worker_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <HardHat size={14} color="#64748b" />
                          Assigned to <span style={{ fontWeight: '600' }}>{c.worker_name}</span>
                        </div>
                      ) : (
                        user.role === 'officer' && c.status !== 'resolved' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ef4444' }}>
                            <AlertTriangle size={14} /> Unassigned
                          </div>
                        )
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      
                      {/* Officer Assign Flow */}
                      {user.role === 'officer' && c.status !== 'resolved' && (
                        assigningId === c.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <select
                              value={selectedWorker[c.id] || ''}
                              onChange={e => setSelectedWorker({ ...selectedWorker, [c.id]: e.target.value })}
                              style={{
                                padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
                                fontSize: '13px', outline: 'none', background: 'white', margin: 0, width: '160px'
                              }}
                            >
                              <option value="">Select worker...</option>
                              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <button onClick={() => assignWorker(c.id)} style={{
                              padding: '7px 12px', background: '#0f172a', color: 'white',
                              border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                            }}>Save</button>
                            <button onClick={() => setAssigningId(null)} style={{
                              padding: '7px', background: 'transparent', color: '#64748b',
                              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'
                            }}><XCircle size={18} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setAssigningId(c.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', background: 'transparent',
                            color: '#0f172a', border: '1px solid #cbd5e1',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                          }}>
                            {c.assigned_to ? <RefreshCw size={14} /> : <UserPlus size={14} />}
                            {c.assigned_to ? 'Reassign' : 'Assign'}
                          </button>
                        )
                      )}

                      {/* Status Buttons */}
                      {user.role === 'officer' && c.status === 'open' && (
                        <button onClick={() => updateStatus(c.id, 'in_progress')} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', background: '#0f172a', color: 'white', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                        }}>
                          <Play size={14} /> Start Task
                        </button>
                      )}

                      {(user.role === 'officer' || user.role === 'worker') && c.status === 'in_progress' && (
                        <button onClick={() => updateStatus(c.id, 'resolved')} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', background: '#16a34a', color: 'white', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                        }}>
                          <CheckCircle size={14} /> Mark Resolved
                        </button>
                      )}

                      {user.role === 'worker' && c.status === 'open' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                          <Clock size={14} /> Pending
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ 
              textAlign: 'center', padding: '80px 20px', 
              background: 'white', border: '1px dashed #cbd5e1', borderRadius: '12px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                {user.role === 'worker' ? <PartyPopper size={48} color="#94a3b8" strokeWidth={1.5} /> : <Inbox size={48} color="#94a3b8" strokeWidth={1.5} />}
              </div>
              <h3 style={{ fontSize: '18px', color: '#0f172a', fontWeight: '600', marginBottom: '6px' }}>
                {user.role === 'worker' ? 'You\'re all caught up!' : 'Inbox Zero'}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>
                {user.role === 'worker'
                  ? 'No tasks assigned to you right now. Take a breather.'
                  : 'There are no complaints matching this filter.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
