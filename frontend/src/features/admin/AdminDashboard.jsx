import { useState, useEffect, useCallback } from 'react';
import { Users, BookCopy, ClipboardList, DollarSign, CirclePlus, Pencil, Trash2 } from 'lucide-react';
import adminService  from '../../services/admin.service';
import courseService from '../../services/course.service';
import Button     from '../../components/Button';
import Modal      from '../../components/Modal';
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await adminService.deleteUser(deleteTarget.id);
      setData((prev) => ({
        rows:  prev.rows.filter((u) => u.id !== deleteTarget.id),
        total: prev.total - 1,
      }));
      setDeleteTarget(null);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setDeleting(false);
    }
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
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Actions</th>
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
              <td className="py-3 pr-4">
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
              <td className="py-3">
                <button
                  onClick={() => setDeleteTarget(u)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={!!deleteTarget} onClose={() => { setDeleteTarget(null); setError(null); }} title="Delete user">
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete <strong>{deleteTarget?.full_name || deleteTarget?.username}</strong>?
          This cannot be undone. Users with linked courses or audit history cannot be deleted —
          disable the account instead.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => { setDeleteTarget(null); setError(null); }}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

const emptyCourseForm = {
  title: '', categoryId: '', description: '',
  price: '0', level: 'beginner', durationHrs: '0',
  thumbnailUrl: '', isPublished: false,
};

const CourseForm = ({ initial, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState({ ...emptyCourseForm, ...initial });

  const handle = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [id]: type === 'checkbox' ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      title:        form.title,
      categoryId:   Number(form.categoryId),
      description:  form.description || null,
      price:        Number(form.price) || 0,
      level:        form.level,
      durationHrs:  Number(form.durationHrs) || 0,
      thumbnailUrl: form.thumbnailUrl || null,
      isPublished:  Boolean(form.isPublished),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <InputField id="title" label="Title" value={form.title} onChange={handle} required />
      <InputField id="categoryId" label="Category ID" type="number" value={form.categoryId} onChange={handle} required />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" rows={3} value={form.description}
          onChange={handle} className="input-field resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputField id="price" label="Price (MYR)" type="number" value={form.price} onChange={handle} />
        <InputField id="durationHrs" label="Duration (hrs)" type="number" value={form.durationHrs} onChange={handle} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="level" className="text-sm font-medium text-gray-700">Level</label>
        <select id="level" value={form.level} onChange={handle} className="input-field">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <InputField id="thumbnailUrl" label="Thumbnail URL" value={form.thumbnailUrl} onChange={handle} />
      <label className="flex items-center gap-2 text-sm">
        <input id="isPublished" type="checkbox" checked={!!form.isPublished} onChange={handle} />
        Publish immediately
      </label>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>Save</Button>
      </div>
    </form>
  );
};

const MaterialsManager = ({ courseId, onClose }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', materialType: 'document', contentUrl: '', orderIndex: 0, isFree: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMaterials(await courseService.getCourseMaterials(courseId)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (m) => {
    setEditing(m);
    setForm({
      title: m.title, materialType: m.material_type, contentUrl: m.content_url || '',
      orderIndex: m.order_index, isFree: !!m.is_free,
    });
  };

  const startCreate = () => {
    setEditing({});
    setForm({ title: '', materialType: 'document', contentUrl: '', orderIndex: materials.length, isFree: false });
  };

  const handle = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [id]: type === 'checkbox' ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        materialType: form.materialType,
        contentUrl: form.contentUrl || null,
        orderIndex: Number(form.orderIndex) || 0,
        isFree: Boolean(form.isFree),
      };
      if (editing.id) {
        await courseService.updateMaterial(courseId, editing.id, payload);
      } else {
        await courseService.createMaterial(courseId, payload);
      }
      setEditing(null);
      await load();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const remove = async (matId) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await courseService.deleteMaterial(courseId, matId);
      await load();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Materials</h3>
        <Button variant="secondary" type="button" onClick={startCreate}>+ Add material</Button>
      </div>

      {loading ? <div className="h-24 animate-pulse bg-gray-100 rounded-xl" /> :
        materials.length === 0 ? (
          <p className="text-sm text-gray-400">No materials yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 text-sm">
            {materials.map((m) => (
              <li key={m.id} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.title}</p>
                  <p className="text-xs text-gray-400">
                    {m.material_type} · order {m.order_index} · {m.is_free ? 'free' : 'paid'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(m)} className="text-gray-500 hover:text-primary-600 p-1"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(m.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )
      }

      {editing && (
        <form onSubmit={save} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
          <InputField id="title" label="Title" value={form.title} onChange={handle} required />
          <div className="flex flex-col gap-1">
            <label htmlFor="materialType" className="text-sm font-medium text-gray-700">Type</label>
            <select id="materialType" value={form.materialType} onChange={handle} className="input-field">
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="quiz">Quiz</option>
              <option value="link">Link</option>
            </select>
          </div>
          <InputField id="contentUrl" label="Content URL" value={form.contentUrl} onChange={handle} />
          <InputField id="orderIndex" label="Order index" type="number" value={form.orderIndex} onChange={handle} />
          <label className="flex items-center gap-2 text-sm">
            <input id="isFree" type="checkbox" checked={!!form.isFree} onChange={handle} />
            Free preview
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing.id ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      )}

      <div className="flex justify-end">
        <Button variant="secondary" type="button" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [materialsTarget, setMaterialsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCourses(await adminService.getAllCourses()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id, isPublished) => {
    setToggling(id);
    try {
      await adminService.toggleCoursePublished(id, !isPublished);
      setCourses((prev) => prev.map((c) => c.id === id ? { ...c, is_published: !isPublished } : c));
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await courseService.createCourse(data);
      setCreateOpen(false);
      await load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      await courseService.updateCourse(editTarget.id, data);
      setEditTarget(null);
      await load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await courseService.deleteCourse(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="h-40 animate-pulse bg-gray-100 rounded-xl" />;

  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Courses ({courses.length})</h2>
        <Button variant="secondary" onClick={() => setCreateOpen(true)}>+ New course</Button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="pb-2 pr-4">Title</th>
            <th className="pb-2 pr-4">Instructor</th>
            <th className="pb-2 pr-4">Price</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Actions</th>
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
              <td className="py-3 pr-4">
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
              <td className="py-3 flex items-center gap-2">
                <button onClick={() => setEditTarget(c)} className="text-gray-500 hover:text-primary-600 p-1" title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setMaterialsTarget(c)} className="text-gray-500 hover:text-primary-600 p-1" title="Materials"><ClipboardList className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(c)} className="text-red-500 hover:text-red-700 p-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New course">
        <CourseForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitting={saving} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit course">
        {editTarget && (
          <CourseForm
            initial={{
              title: editTarget.title,
              categoryId: editTarget.category_id ?? '',
              description: editTarget.description ?? '',
              price: editTarget.price ?? '0',
              level: editTarget.level ?? 'beginner',
              durationHrs: editTarget.duration_hrs ?? '0',
              thumbnailUrl: editTarget.thumbnail_url ?? '',
              isPublished: !!editTarget.is_published,
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            submitting={saving}
          />
        )}
      </Modal>

      <Modal isOpen={!!materialsTarget} onClose={() => setMaterialsTarget(null)} title={`Materials — ${materialsTarget?.title || ''}`}>
        {materialsTarget && (
          <MaterialsManager courseId={materialsTarget.id} onClose={() => setMaterialsTarget(null)} />
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete course">
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete <strong>{deleteTarget?.title}</strong>? All enrolments, payments and reviews
          tied to this course will also be removed.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

const AnnouncementsSection = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await adminService.getAnnouncements()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ title: '', body: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditTarget(a);
    setForm({ title: a.title, body: a.body, isActive: !!a.is_active });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await adminService.updateAnnouncement(editTarget.id, form);
        setEditTarget(null);
      } else {
        await adminService.createAnnouncement(form.title, form.body);
        setModalOpen(false);
      }
      setForm({ title: '', body: '', isActive: true });
      await load();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteAnnouncement(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="h-32 animate-pulse bg-gray-100 rounded-xl" />;

  const modalOpenAny = modalOpen || !!editTarget;
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm({ title: '', body: '', isActive: true });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Announcements</h2>
        <Button variant="secondary" onClick={openCreate}>+ New</Button>
      </div>
      {list.length === 0 ? <p className="text-sm text-gray-400">No announcements yet.</p> : (
        <ul className="divide-y divide-gray-100">
          {list.map((a) => (
            <li key={a.id} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.admin} · {new Date(a.created_at).toLocaleDateString('en-MY')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {a.is_active ? 'Active' : 'Hidden'}
                </span>
                <button onClick={() => openEdit(a)} className="text-gray-500 hover:text-primary-600 p-1" title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(a)} className="text-red-500 hover:text-red-700 p-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={modalOpenAny} onClose={closeModal} title={editTarget ? 'Edit announcement' : 'New announcement'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField id="title" label="Title" value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Body</label>
            <textarea value={form.body} rows={3} className="input-field resize-none"
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} required />
          </div>
          {editTarget && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
              Active
            </label>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saving}>{editTarget ? 'Save' : 'Publish'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete announcement">
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete <strong>{deleteTarget?.title}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
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


