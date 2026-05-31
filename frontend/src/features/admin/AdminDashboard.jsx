import { useState, useEffect, useCallback } from 'react';
import { Users, BookCopy, ClipboardList, DollarSign, CirclePlus } from 'lucide-react';
import adminService from '../../services/admin.service';
import Button from '../../components/Button';
import Modal  from '../../components/Modal';
import InputField from '../../components/InputField';

const StatCard = ({ label, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total users"       value={stats?.totalUsers}       icon={<Users />} color="bg-blue-50" />
      <StatCard label="Total courses"     value={stats?.totalCourses}     icon={<BookCopy />} color="bg-purple-50" />
      <StatCard label="Active enrolments" value={stats?.activeEnrolments} icon={<ClipboardList />} color="bg-green-50" />
      <StatCard label="Revenue (MYR)"     value={`RM ${(stats?.totalRevenue ?? 0).toFixed(2)}`} icon={<DollarSign />} color="bg-yellow-50" />
    </div>
  );
};

const UsersSection = () => {
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await adminService.getAllUsers()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggle = async (id, isActive) => {
    setToggling(id);
    try {
      const updated = await adminService.toggleUserStatus(id, !isActive);
      setData((prev) => ({ ...prev, rows: prev.rows.map((u) => u.id === id ? updated : u) }));
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  if (loading) return <div className="h-40 animate-pulse bg-gray-100 rounded-xl" />;

  return (
    <div className="card overflow-x-auto">
      <h2 className="font-semibold mb-4">Users ({data.total})</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="pb-2 pr-4">Name</th>
            <th className="pb-2 pr-4">Email</th>
            <th className="pb-2 pr-4">Role</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.rows.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="py-3 pr-4 font-medium">{u.full_name || u.username}</td>
              <td className="py-3 pr-4 text-gray-500">{u.email}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  u.role === 'admin' ? 'bg-red-100 text-red-700' :
                  u.role === 'instructor' ? 'bg-purple-100 text-purple-700' :
                  'bg-blue-100 text-blue-700'}`}>{u.role}</span>
              </td>
              <td className="py-3">
                <button
                  disabled={toggling === u.id}
                  onClick={() => handleToggle(u.id, u.is_active)}
                  className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                    u.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                  {toggling === u.id ? '…' : u.is_active ? 'Active' : 'Disabled'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    adminService.getAllCourses().then(setCourses).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id, isPublished) => {
    setToggling(id);
    try {
      await adminService.toggleCoursePublished(id, !isPublished);
      setCourses((prev) => prev.map((c) => c.id === id ? { ...c, is_published: !isPublished } : c));
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  if (loading) return <div className="h-40 animate-pulse bg-gray-100 rounded-xl" />;

  return (
    <div className="card overflow-x-auto">
      <h2 className="font-semibold mb-4">Courses ({courses.length})</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="pb-2 pr-4">Title</th>
            <th className="pb-2 pr-4">Instructor</th>
            <th className="pb-2 pr-4">Price</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {courses.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="py-3 pr-4 font-medium max-w-xs truncate">{c.title}</td>
              <td className="py-3 pr-4 text-gray-500">{c.instructor}</td>
              <td className="py-3 pr-4 text-primary-600 font-medium">
                {c.price === '0.00' ? 'Free' : `RM ${c.price}`}
              </td>
              <td className="py-3">
                <button
                  disabled={toggling === c.id}
                  onClick={() => handleToggle(c.id, c.is_published)}
                  className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                    c.is_published
                      ? 'bg-green-100 text-green-700 hover:bg-yellow-100 hover:text-yellow-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                  {toggling === c.id ? '…' : c.is_published ? 'Published' : 'Draft'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnnouncementsSection = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getAnnouncements().then(setList).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await adminService.createAnnouncement(form.title, form.body);
      setList((prev) => [created, ...prev]);
      setModalOpen(false);
      setForm({ title: '', body: '' });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="h-32 animate-pulse bg-gray-100 rounded-xl" />;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Announcements</h2>
        <Button variant="secondary" onClick={() => setModalOpen(true)}>+ New</Button>
      </div>
      {list.length === 0 ? <p className="text-sm text-gray-400">No announcements yet.</p> : (
        <ul className="divide-y divide-gray-100">
          {list.map((a) => (
            <li key={a.id} className="py-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.admin} · {new Date(a.created_at).toLocaleDateString('en-MY')}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {a.is_active ? 'Active' : 'Hidden'}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New announcement">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <InputField id="title" label="Title" value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Body</label>
            <textarea value={form.body} rows={3} className="input-field resize-none"
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} required />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Publish</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const AuditLogsSection = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAuditLogs(20).then(setLogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 animate-pulse bg-gray-100 rounded-xl" />;

  return (
    <div className="card">
      <h2 className="font-semibold mb-4">Recent audit log</h2>
      {logs.length === 0 ? <p className="text-sm text-gray-400">No actions recorded yet.</p> : (
        <ul className="divide-y divide-gray-100 text-sm">
          {logs.map((l) => (
            <li key={l.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                  {l.action}
                </span>
                <span className="text-gray-500">{l.target_type} #{l.target_id}</span>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {l.admin} · {new Date(l.created_at).toLocaleString('en-MY')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TABS = ['Overview', 'Users', 'Courses', 'Announcements', 'Audit Log'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">MyEduConnect platform management</p>
      </div>
      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-6">
        {activeTab === 'Overview'      && <><StatsSection /><AnnouncementsSection /></>}
        {activeTab === 'Users'         && <UsersSection />}
        {activeTab === 'Courses'       && <CoursesSection />}
        {activeTab === 'Announcements' && <AnnouncementsSection />}
        {activeTab === 'Audit Log'     && <AuditLogsSection />}
      </div>
    </div>
  );
};

export default AdminDashboard;


