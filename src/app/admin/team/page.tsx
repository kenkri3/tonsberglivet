'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  Trash2,
  Key,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Activity,
  CheckSquare,
  StickyNote,
  Pin,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Lock,
  RefreshCw,
  X,
  UserCheck,
  Eye,
  Check,
  ChevronRight,
  Sparkles,
  Send,
  Copy,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  title: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
  _count?: {
    articles: number;
    assignedTasks: number;
  };
}

interface ActivityItem {
  id: string;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  details: string;
  targetType: string | null;
  createdAt: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  assignedTo: { id: string; name: string | null; email: string; role: string; title?: string | null } | null;
  createdBy: { id: string; name: string | null; email: string } | null;
  createdAt: string;
}

interface NoteItem {
  id: string;
  content: string;
  pinned: boolean;
  author: { id: string; name: string | null; email: string; role: string } | null;
  createdAt: string;
}

/** En invitasjon til en ny medarbeider. */
interface InvitationItem {
  id: string;
  email: string;
  name: string | null;
  title: string | null;
  role: 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  roleLabel: string;
  note: string | null;
  invitedByName: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

const ROLE_BADGES: Record<string, { label: string; bg: string; icon: any }> = {
  SUPERADMIN: { label: 'Superbruker', bg: 'bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-300', icon: Shield },
  ADMIN: { label: 'Administrator', bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400', icon: ShieldAlert },
  EDITOR: { label: 'Redaktør', bg: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400', icon: ShieldCheck },
  VIEWER: { label: 'Innsyn / Leser', bg: 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400', icon: Eye },
};

/** Tilgangsnivåene en invitasjon kan gi, i synkende rekkefølge. */
const INVITE_ROLE_OPTIONS: Array<{ value: InvitationItem['role']; label: string; description: string }> = [
  { value: 'SUPERADMIN', label: 'Superbruker', description: 'Eiernivå: invitere brukere og dele ut alle tilgangsnivåer.' },
  { value: 'ADMIN', label: 'Administrator', description: 'Full tilgang til drift, innhold og meldinger. Kan invitere nye brukere.' },
  { value: 'EDITOR', label: 'Redaktør', description: 'Kan svare på henvendelser, tildele samtaler og jobbe med innhold.' },
  { value: 'VIEWER', label: 'Innsyn', description: 'Kan se innhold og statistikk, men ikke svare eller endre noe.' },
];

/** Hvilke nivåer den innloggede kan dele ut. Administratornivå kan dele ut alt. */
const GRANTABLE_ROLES: Record<string, InvitationItem['role'][]> = {
  SUPERADMIN: ['SUPERADMIN', 'ADMIN', 'EDITOR', 'VIEWER'],
  ADMIN: ['SUPERADMIN', 'ADMIN', 'EDITOR', 'VIEWER'],
  EDITOR: [],
  VIEWER: [],
};

export default function TeamManagementPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'tasks' | 'notes'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<UserItem | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Form states - User
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EDITOR' as 'ADMIN' | 'EDITOR' | 'VIEWER',
    title: '',
    phone: '',
    active: true,
  });

  // Form state - Password reset
  const [newPassword, setNewPassword] = useState('');

  // Form states - Task
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    dueDate: '',
    assignedToId: '',
  });

  // Form state - Note
  const [noteContent, setNoteContent] = useState('');
  const [notePinned, setNotePinned] = useState(false);

  // Notifications
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Invitasjoner
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    title: '',
    role: 'EDITOR' as InvitationItem['role'],
    note: '',
  });
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{
    email: string;
    inviteUrl: string;
    delivered: boolean;
    message: string;
  } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Current user
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meJson = await meRes.json();
        if (meJson.authenticated) setCurrentUser(meJson.user);
      }

      // 2. Users
      const usersRes = await fetch('/api/admin/users');
      const usersJson = await usersRes.json();
      if (usersJson.success) setUsers(usersJson.users || []);

      // 3. Activities
      const actRes = await fetch('/api/admin/activity?limit=50');
      const actJson = await actRes.json();
      if (actJson.success) setActivities(actJson.activities || []);

      // 4. Tasks
      const tasksRes = await fetch('/api/admin/tasks');
      const tasksJson = await tasksRes.json();
      if (tasksJson.success) setTasks(tasksJson.tasks || []);

      // 5. Notes
      const notesRes = await fetch('/api/admin/notes');
      const notesJson = await notesRes.json();
      if (notesJson.success) setNotes(notesJson.notes || []);

      // 6. Invitasjoner (kun synlig for administratornivå – API-et svarer 403 ellers)
      const inviteRes = await fetch('/api/admin/invitations');
      if (inviteRes.ok) {
        const inviteJson = await inviteRes.json();
        if (inviteJson.success) setInvitations(inviteJson.invitations || []);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
      showAlert('error', 'Kunne ikke laste all team-data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ── Invitasjoner ─────────────────────────────────────────────────────────
  // Bare administratornivå kan invitere. Hvilke nivåer man kan dele ut følger
  // av ens egen rolle – en administrator kan ikke gjøre noen til superbruker.
  const canInvite = !!currentUser && GRANTABLE_ROLES[currentUser.role as string]?.length > 0;
  const grantableRoles = (currentUser && GRANTABLE_ROLES[currentUser.role as string]) || [];

  const openInviteModal = () => {
    setInviteForm({
      email: '',
      name: '',
      title: '',
      role: (grantableRoles.includes('EDITOR') ? 'EDITOR' : grantableRoles[0]) || 'EDITOR',
      note: '',
    });
    setInviteError(null);
    setInviteResult(null);
    setCopiedInvite(false);
    setInviteModalOpen(true);
  };

  const handleCreateInvitation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inviteBusy) return;

    if (!inviteForm.email.trim()) {
      setInviteError('Fyll inn e-postadressen til den du vil invitere.');
      return;
    }

    setInviteBusy(true);
    setInviteError(null);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setInviteError(json?.error || `Kunne ikke opprette invitasjonen (HTTP ${res.status}).`);
        return;
      }

      setInviteResult({
        email: json.invitation?.email || inviteForm.email,
        inviteUrl: json.inviteUrl,
        delivered: !!json.email?.delivered,
        message: json.message || '',
      });
      setInvitations((prev) => [json.invitation, ...prev]);
      showAlert('success', json.message || 'Invitasjonen er opprettet.');
    } catch {
      setInviteError('Nettverksfeil: invitasjonen ble ikke opprettet.');
    } finally {
      setInviteBusy(false);
    }
  };

  const handleCopyInviteLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 3000);
    } catch {
      setInviteError('Kunne ikke kopiere automatisk – merk teksten og kopier manuelt.');
    }
  };

  const handleRevokeInvitation = async (invitation: InvitationItem) => {
    const previous = invitations;
    setInvitations((prev) =>
      prev.map((i) => (i.id === invitation.id ? { ...i, status: 'REVOKED' as const } : i))
    );
    try {
      const res = await fetch(`/api/admin/invitations/${invitation.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setInvitations(previous);
        showAlert('error', json?.error || 'Kunne ikke trekke tilbake invitasjonen.');
        return;
      }
      showAlert('success', `Invitasjonen til ${invitation.email} er trukket tilbake.`);
    } catch {
      setInvitations(previous);
      showAlert('error', 'Nettverksfeil: invitasjonen ble ikke trukket tilbake.');
    }
  };

  // Handlers for User Modal
  const openCreateUserModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'EDITOR',
      title: '',
      phone: '',
      active: true,
    });
    setUserModalOpen(true);
  };

  const openEditUserModal = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '',
      role: user.role,
      title: user.title || '',
      phone: user.phone || '',
      active: user.active,
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Oppdater bruker
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            role: formData.role,
            title: formData.title,
            phone: formData.phone,
            active: formData.active,
            ...(formData.password ? { password: formData.password } : {}),
          }),
        });
        const json = await res.json();
        if (json.success) {
          showAlert('success', 'Bruker ble oppdatert!');
          setUserModalOpen(false);
          loadAllData();
        } else {
          showAlert('error', json.error || 'Kunne ikke oppdatere bruker.');
        }
      } else {
        // Opprett bruker
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          showAlert('success', 'Ny bruker ble opprettet!');
          setUserModalOpen(false);
          loadAllData();
        } else {
          showAlert('error', json.error || 'Kunne ikke opprette bruker.');
        }
      }
    } catch (err: any) {
      showAlert('error', 'Nettverksfeil ved lagring av bruker.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    if (!confirm(`Er du sikker på at du vil slette brukeren ${userName || 'denne brukeren'}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showAlert('success', 'Bruker ble slettet.');
        loadAllData();
      } else {
        showAlert('error', json.error || 'Kunne ikke slette bruker.');
      }
    } catch {
      showAlert('error', 'Feil ved sletting av bruker.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser || !newPassword) return;
    try {
      const res = await fetch(`/api/admin/users/${passwordTargetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        showAlert('success', `Passordet for ${passwordTargetUser.name || passwordTargetUser.email} er oppdatert!`);
        setPasswordModalOpen(false);
        setNewPassword('');
      } else {
        showAlert('error', json.error || 'Kunne ikke nullstille passord.');
      }
    } catch {
      showAlert('error', 'Feil ved nullstilling av passord.');
    }
  };

  // Handlers for Tasks
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskFormData),
      });
      const json = await res.json();
      if (json.success) {
        showAlert('success', 'Oppgave opprettet!');
        setTaskModalOpen(false);
        setTaskFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
        loadAllData();
      } else {
        showAlert('error', json.error || 'Kunne ikke opprette oppgave.');
      }
    } catch {
      showAlert('error', 'Feil ved opprettelse av oppgave.');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/admin/tasks?id=${taskId}`, { method: 'DELETE' });
      if (res.ok) loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Notes
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent, pinned: notePinned }),
      });
      const json = await res.json();
      if (json.success) {
        showAlert('success', 'Notat lagt til på tavlen!');
        setNoteModalOpen(false);
        setNoteContent('');
        setNotePinned(false);
        loadAllData();
      } else {
        showAlert('error', json.error || 'Kunne ikke lagre notat.');
      }
    } catch {
      showAlert('error', 'Feil ved lagring av notat.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/admin/notes?id=${noteId}`, { method: 'DELETE' });
      if (res.ok) loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!#%*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pwd }));
    setNewPassword(pwd);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRoleFilter === 'ALL'
        ? true
        : selectedRoleFilter === 'ACTIVE'
        ? u.active
        : selectedRoleFilter === 'INACTIVE'
        ? !u.active
        : u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Team & Samhandling
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administrer brukere, roller, oppgaver og felles redaksjonell aktivitet for Tønsberglivet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Oppdater data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canInvite && (
            <>
              <button
                onClick={openInviteModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition"
                title="Send en invitasjon med valgt tilgangsnivå"
              >
                <UserPlus className="w-4 h-4" />
                Inviter bruker
              </button>
              <button
                onClick={openCreateUserModal}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm transition"
                title="Opprett en konto direkte med passord du setter selv"
              >
                <Plus className="w-4 h-4" />
                Ny bruker
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert toast */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Brukere totalt</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{users.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">
            {users.filter(u => u.active).length} aktive kontoer
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Administratorer</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Full systemtilgang</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Redaksjon</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            {users.filter(u => u.role === 'EDITOR').length}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Skrive- & publiseringstilgang</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Felles oppgaver</span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            {tasks.filter(t => t.status !== 'COMPLETED').length}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            {tasks.filter(t => t.status === 'COMPLETED').length} fullført
          </span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'users'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Brukere & Tilganger
          <span className="text-xs py-0.5 px-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'activity'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          Aktivitetsstrøm
          <span className="text-xs py-0.5 px-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {activities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'tasks'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Redaksjonelle Oppgaver
          <span className="text-xs py-0.5 px-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {tasks.filter(t => t.status !== 'COMPLETED').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'notes'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          Felles Notatvegg
          <span className="text-xs py-0.5 px-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {notes.length}
          </span>
        </button>
      </div>

      {/* TAB 1: USERS & PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Invitasjoner: ventende, godtatte og tilbaketrukne */}
          {canInvite && invitations.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invitasjoner</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {invitations.filter((i) => i.status === 'PENDING').length} venter
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Lenken vises bare én gang – er den tapt, send en ny.
                </span>
              </div>

              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {invitations.slice(0, 8).map((invitation) => {
                  const badge = ROLE_BADGES[invitation.role] || ROLE_BADGES.EDITOR;
                  const statusText =
                    invitation.status === 'PENDING'
                      ? `Venter – gyldig til ${new Date(invitation.expiresAt).toLocaleDateString('nb-NO')}`
                      : invitation.status === 'ACCEPTED'
                      ? `Godtatt ${invitation.acceptedAt ? new Date(invitation.acceptedAt).toLocaleDateString('nb-NO') : ''}`
                      : invitation.status === 'REVOKED'
                      ? 'Trukket tilbake'
                      : 'Utløpt';
                  const statusTone =
                    invitation.status === 'PENDING'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                      : invitation.status === 'ACCEPTED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';

                  return (
                    <li key={invitation.id} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {invitation.name || invitation.email}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusTone}`}>
                            {statusText}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {invitation.email}
                          {invitation.title ? ` • ${invitation.title}` : ''}
                          {invitation.invitedByName ? ` • invitert av ${invitation.invitedByName}` : ''}
                        </p>
                      </div>

                      {invitation.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setInviteForm({
                                email: invitation.email,
                                name: invitation.name || '',
                                title: invitation.title || '',
                                role: invitation.role,
                                note: invitation.note || '',
                              });
                              setInviteError(null);
                              setInviteResult(null);
                              setInviteModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Ny lenke
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeInvitation(invitation)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Trekk tilbake
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk etter navn, e-post eller tittel..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Alle roller</option>
                <option value="SUPERADMIN">Superbrukere</option>
                <option value="ADMIN">Administratorer</option>
                <option value="EDITOR">Redaktører</option>
                <option value="VIEWER">Lesere</option>
                <option value="ACTIVE">Kun aktive</option>
                <option value="INACTIVE">Kun inaktive</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Bruker</th>
                    <th className="px-6 py-3.5">Tittel & Kontakt</th>
                    <th className="px-6 py-3.5">Rolle</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Bidrag</th>
                    <th className="px-6 py-3.5 text-right">Handlinger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        Ingen brukere funnet som matcher søkekriteriene.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const badge = ROLE_BADGES[u.role] || ROLE_BADGES.EDITOR;
                      const RoleIcon = badge.icon;
                      const initials = (u.name || u.email)
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                                {initials}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {u.name || 'Uten navn'}
                                  {currentUser?.id === u.id && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      Deg
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" />
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {u.title ? (
                                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                  <Briefcase className="w-3 h-3 text-slate-400" />
                                  {u.title}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Ingen tittel</span>
                              )}
                              {u.phone && (
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {u.phone}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                              <RoleIcon className="w-3.5 h-3.5" />
                              {badge.label}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {u.active ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Aktiv
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                Deaktivert
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-xs text-slate-500">
                            <div>{u._count?.articles || 0} artikler</div>
                            <div>{u._count?.assignedTasks || 0} oppgaver</div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            {currentUser?.role === "ADMIN" ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditUserModal(u)}
                                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Rediger bruker"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setPasswordTargetUser(u);
                                  setNewPassword('');
                                  setPasswordModalOpen(true);
                                }}
                                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Endre passord"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title="Slett bruker"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Kun visning</span>
                          )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITY STREAM */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Sanntidslogg over administrative og redaksjonelle handlinger i Tønsberglivet.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                Ingen registrerte aktiviteter ennå. Handlinger i portalen logges automatisk her.
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6">
                {activities.map((act) => (
                  <div key={act.id} className="relative pl-6">
                    <span className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {act.userName || act.userEmail || 'System / Bruker'}
                        </span>
                        {act.userRole && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                            {act.userRole}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          {act.action}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(act.createdAt).toLocaleString('no-NO')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {act.details}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EDITORIAL TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Samarbeid om redaksjonelle oppgaver, korrektur og oppfølging.
            </p>
            <button
              onClick={() => setTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Ny oppgave
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: PENDING */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Til behandling ({tasks.filter(t => t.status === 'PENDING').length})
                </span>
              </div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === 'PENDING').map(task => (
                  <div key={task.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white leading-snug">{task.title}</h4>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-slate-400 hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-400">
                        Tildelt: <strong className="text-slate-700 dark:text-slate-300">{task.assignedTo?.name || task.assignedTo?.email || 'Ingen'}</strong>
                      </span>
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                        className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-[11px] font-medium"
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: IN_PROGRESS */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Under arbeid ({tasks.filter(t => t.status === 'IN_PROGRESS').length})
                </span>
              </div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                  <div key={task.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white leading-snug">{task.title}</h4>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-slate-400 hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-400">
                        Tildelt: <strong className="text-slate-700 dark:text-slate-300">{task.assignedTo?.name || task.assignedTo?.email || 'Ingen'}</strong>
                      </span>
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                        className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 text-[11px] font-medium"
                      >
                        Fullfør ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: COMPLETED */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Fullført ({tasks.filter(t => t.status === 'COMPLETED').length})
                </span>
              </div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === 'COMPLETED').map(task => (
                  <div key={task.id} className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 opacity-80">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-white line-through leading-snug">{task.title}</h4>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-slate-400 hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Fullført ✓</span>
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'PENDING')}
                        className="text-[11px] text-slate-400 hover:underline"
                      >
                        Gjenåpne
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REDAKSJONSTAVLE (NOTES) */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Felles notatvegg og beskjeder mellom teammedlemmer på tvers av skift og dager.
            </p>
            <button
              onClick={() => setNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Ny beskjed
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notes.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Tavlen er tom. Legg inn første beskjed til teamet!
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border shadow-xs relative flex flex-col justify-between transition ${
                    n.pinned
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        {n.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        {n.author?.name || n.author?.email || 'Teammedlem'}
                      </span>
                      <button onClick={() => handleDeleteNote(n.id)} className="text-slate-400 hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    {new Date(n.createdAt).toLocaleDateString('no-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* INVITASJONSMODAL — velg tilgangsnivå og send en personlig lenke */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                Inviter bruker
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Lukk"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteResult ? (
              <div className="p-5 space-y-4">
                <div
                  className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
                    inviteResult.delivered
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  {inviteResult.delivered ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {inviteResult.delivered
                        ? `Invitasjonen er sendt til ${inviteResult.email}`
                        : 'E-posten ble ikke sendt automatisk'}
                    </p>
                    <p className="text-xs mt-0.5 opacity-90">{inviteResult.message}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Personlig invitasjonslenke
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={inviteResult.inviteUrl}
                      onFocus={(e) => e.currentTarget.select()}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyInviteLink(inviteResult.inviteUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shrink-0"
                    >
                      {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                      {copiedInvite ? 'Kopiert' : 'Kopier'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Lenken vises bare nå. Er den tapt, kan du lage en ny under «Ny lenke» i invitasjonslisten.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setInviteResult(null);
                      setInviteForm({ email: '', name: '', title: '', role: inviteForm.role, note: '' });
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Inviter en til
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
                  >
                    Ferdig
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateInvitation} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-post *</label>
                    <input
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      placeholder="kollega@tonsberglivet.no"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navn</label>
                    <input
                      type="text"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      placeholder="Fornavn Etternavn"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tittel</label>
                  <input
                    type="text"
                    value={inviteForm.title}
                    onChange={(e) => setInviteForm({ ...inviteForm, title: e.target.value })}
                    placeholder="f.eks. Kommunikasjonsansvarlig"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tilgangsnivå</label>
                  <div className="space-y-1.5">
                    {INVITE_ROLE_OPTIONS.filter((option) => grantableRoles.includes(option.value)).map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => setInviteForm({ ...inviteForm, role: option.value })}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition ${
                          inviteForm.role === option.value
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{option.label}</span>
                          {inviteForm.role === option.value && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">{option.description}</span>
                      </button>
                    ))}
                  </div>
                  {grantableRoles.length === 0 && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      Du har ikke rettighet til å invitere brukere.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Personlig melding (valgfritt)
                  </label>
                  <textarea
                    rows={3}
                    value={inviteForm.note}
                    onChange={(e) => setInviteForm({ ...inviteForm, note: e.target.value })}
                    placeholder="Kort hilsen som følger invitasjonen."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {inviteError && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl px-3.5 py-2.5">
                    {inviteError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">Lenken er gyldig i 7 dager.</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      Avbryt
                    </button>
                    <button
                      type="submit"
                      disabled={inviteBusy || grantableRoles.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {inviteBusy ? 'Sender …' : 'Send invitasjon'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* USER MODAL (Opprett / Rediger) */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                {editingUser ? 'Rediger bruker' : 'Opprett ny bruker'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fullt navn
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="f.eks. Ola Nordmann"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-postadresse
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="bruker@tonsberglivet.no"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {editingUser ? 'Nytt passord (valgfritt)' : 'Passord'}
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generer sikkert
                  </button>
                </div>
                <input
                  type="text"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'La stå tomt for å beholde nåværende' : 'Minst 6 tegn'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stilling / Tittel
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="f.eks. Redaktør"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+47 ..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rolle & Tilgangsnivå
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ADMIN">Administrator (Full tilgang, økonomi, innstillinger og brukere)</option>
                  <option value="EDITOR">Redaktør (Opprette, redigere og publisere innhold & torvleie)</option>
                  <option value="VIEWER">Innsyn / Leser (Skrivebeskyttet tilgang)</option>
                  {grantableRoles.includes('SUPERADMIN') && (
                    <option value="SUPERADMIN">Superbruker (Eiernivå: invitere brukere og dele ut tilgang)</option>
                  )}
                </select>
              </div>

              {editingUser && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="userActiveCheck"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="userActiveCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Aktiv brukerkonto (deaktiver for å stenge tilgang)
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
                >
                  {editingUser ? 'Lagre endringer' : 'Opprett bruker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {passwordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-500" />
                Endre passord
              </h3>
              <button onClick={() => setPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Sett nytt passord for <strong>{passwordTargetUser.name || passwordTargetUser.email}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nytt passord</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Generer
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minst 6 tegn"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                >
                  Oppdater passord
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                Ny redaksjonsoppgave
              </h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Oppgavetittel
                </label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="f.eks. Korrektur på Slottsfjell-artikkel"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Beskrivelse (valgfritt)
                </label>
                <textarea
                  rows={2}
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  placeholder="Utdyp hva som må gjøres..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tildel til
                  </label>
                  <select
                    value={taskFormData.assignedToId}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assignedToId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Ingen (åpen oppgave)</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prioritet
                  </label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">Lav</option>
                    <option value="MEDIUM">Middels</option>
                    <option value="HIGH">Høy / Haster</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                >
                  Opprett oppgave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW NOTE MODAL */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-indigo-500" />
                Ny beskjed til redaksjonen
              </h3>
              <button onClick={() => setNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Innhold
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Skriv felles beskjed, hendelsesvarsel eller vaktnotat..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNoteCheck"
                  checked={notePinned}
                  onChange={(e) => setNotePinned(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="pinNoteCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Pin className="w-3 h-3 text-amber-500" /> Fest øverst på tavlen
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                >
                  Legg til på tavlen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
