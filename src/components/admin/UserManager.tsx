import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api, AdminUser, UserRole } from '../../api/client';
import { MediaLibrary } from './MediaLibrary';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  Key,
  Edit2,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
  Sparkles,
  BookOpen,
  Feather,
  FileEdit,
  Mail,
  Calendar,
  Lock,
  User,
  Image as ImageIcon
} from 'lucide-react';

interface UserManagerProps {
  token: string | null;
  currentUser?: { id?: string; email?: string; name?: string; role?: string } | null;
}

const ROLE_DEFINITIONS: Record<UserRole, {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: any;
  summary: string;
  permissions: string[];
}> = {
  admin: {
    label: 'Administrator',
    badgeBg: 'bg-[#FFF0E8]',
    badgeText: 'text-[#C85228]',
    badgeBorder: 'border-[#FFCEBA]',
    icon: ShieldCheck,
    summary: 'Full superuser access to the entire blog platform',
    permissions: [
      'Manage team members & assign roles',
      'Full article, page & category management',
      'Yoast SEO settings & indexing pings',
      'Theme appearance & customizer',
      'Affiliate engine & tracking controls'
    ]
  },
  editor: {
    label: 'Editor',
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#7E22CE]',
    badgeBorder: 'border-[#E9D5FF]',
    icon: BookOpen,
    summary: 'Publish and review editorial stories and categories',
    permissions: [
      'Write, edit, and publish any article',
      'Create and modify dynamic custom pages',
      'Manage categories and subcategory tags',
      'Upload and optimize media files',
      'Review reader inquiries & comments'
    ]
  },
  author: {
    label: 'Author',
    badgeBg: 'bg-[#E0F2FE]',
    badgeText: 'text-[#0369A1]',
    badgeBorder: 'border-[#BAE6FD]',
    icon: Feather,
    summary: 'Write and publish original editorial stories',
    permissions: [
      'Write, edit, and publish own articles',
      'Upload photography to Media Library',
      'View own post readership analytics'
    ]
  },
  contributor: {
    label: 'Contributor',
    badgeBg: 'bg-[#ECFDF5]',
    badgeText: 'text-[#047857]',
    badgeBorder: 'border-[#A7F3D0]',
    icon: FileEdit,
    summary: 'Draft articles for editorial review and approval',
    permissions: [
      'Draft stories for editorial review',
      'Upload images to media library',
      'Cannot publish directly to live site'
    ]
  }
};

export const UserManager: React.FC<UserManagerProps> = ({ token, currentUser }) => {
  const { refreshSiteSettings } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'add' | 'edit'>('edit');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'author' as UserRole,
    avatar: ''
  });
  const [showAddPassword, setShowAddPassword] = useState<boolean>(false);
  const [isUploadingAddAvatar, setIsUploadingAddAvatar] = useState<boolean>(false);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'author' as UserRole,
    avatar: ''
  });
  const [isUploadingEditAvatar, setIsUploadingEditAvatar] = useState<boolean>(false);

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.getUsers(token);
      setUsers(res.users || []);
    } catch (err: any) {
      console.warn('Error fetching users:', err);
      showToast('error', err.message || 'Failed to load team users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Helper: Generate secure random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  // Handle Avatar Upload for Add User
  const handleAddAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setIsUploadingAddAvatar(true);
    try {
      const uploadRes = await api.uploadMedia(token, file);
      setAddForm((prev) => ({ ...prev, avatar: uploadRes.url }));
      showToast('success', 'Avatar image uploaded');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload avatar image');
    } finally {
      setIsUploadingAddAvatar(false);
      e.target.value = '';
    }
  };

  // Handle Avatar Upload for Edit User
  const handleEditAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setIsUploadingEditAvatar(true);
    try {
      const uploadRes = await api.uploadMedia(token, file);
      setEditForm((prev) => ({ ...prev, avatar: uploadRes.url }));
      showToast('success', 'Avatar image updated');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload avatar image');
    } finally {
      setIsUploadingEditAvatar(false);
      e.target.value = '';
    }
  };

  // 1. Submit Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!addForm.name.trim()) {
      showToast('error', 'Full name is required');
      return;
    }
    if (!addForm.email.trim() || !addForm.email.includes('@')) {
      showToast('error', 'A valid email address is required');
      return;
    }
    if (addForm.password.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createUser(token, {
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password,
        role: addForm.role,
        avatar: addForm.avatar.trim() || undefined
      });

      showToast('success', res.message || `User '${addForm.name}' created successfully`);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        role: 'author',
        avatar: ''
      });
      await fetchUsers();
      await refreshSiteSettings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Open Edit User Modal
  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || ''
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser) return;

    if (!editForm.name.trim()) {
      showToast('error', 'Full name cannot be empty');
      return;
    }
    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      showToast('error', 'A valid email address is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.updateUser(token, selectedUser.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
        avatar: editForm.avatar.trim() || undefined
      });

      showToast('success', res.message || 'User updated successfully');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
      await refreshSiteSettings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Open Change Password Modal
  const openPasswordModal = (user: AdminUser) => {
    setSelectedUser(user);
    setPasswordForm({
      password: '',
      confirmPassword: ''
    });
    setIsPasswordModalOpen(true);
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser) return;

    if (passwordForm.password.length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.changeUserPassword(token, selectedUser.id, passwordForm.password);
      showToast('success', res.message || `Password updated for '${selectedUser.name}'`);
      setIsPasswordModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Open Delete User Modal
  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Submit Delete User
  const handleDeleteUser = async () => {
    if (!token || !selectedUser) return;

    setIsSubmitting(true);
    try {
      const res = await api.deleteUser(token, selectedUser.id);
      showToast('success', res.message || 'User removed successfully');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
      await refreshSiteSettings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Role counts
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const editorCount = users.filter((u) => u.role === 'editor').length;
  const authorContributorCount = users.filter((u) => u.role === 'author' || u.role === 'contributor').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-inherit hover:opacity-70 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EDE7DF] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8734A] block">
                Access &bull; Team &bull; Permissions
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#8C8477] border border-[#EAE5DF]">
                {totalUsers} Members Registered
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18] mt-1">
              Team &amp; User Management
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7468] mt-1 max-w-2xl leading-relaxed">
              Create and manage administrative accounts, assign editorial roles with granular access controls, and securely update team credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] text-[#4A453E] hover:text-[#E8734A] transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              title="Refresh User List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E8734A]' : ''}`} />
            </button>
            <button
              onClick={() => {
                setAddForm({
                  name: '',
                  email: '',
                  password: '',
                  role: 'author',
                  avatar: ''
                });
                setIsAddModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-[#E8734A] hover:bg-[#D5623A] text-white font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Member</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-[#F0ECE6]">
          {/* Total Members */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#DDD7CD] flex items-center justify-center text-[#1E1B18] shadow-2xs">
              <Users className="w-5 h-5 text-[#E8734A]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#8C8477] uppercase tracking-wider">Total Accounts</div>
              <div className="text-xl font-bold font-serif text-[#1E1B18]">{totalUsers}</div>
            </div>
          </div>

          {/* Administrators */}
          <div className="p-4 rounded-2xl bg-[#FFF5EF] border border-[#FFCEBA] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#FFCEBA] flex items-center justify-center text-[#C85228] shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#E8734A]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#C85228] uppercase tracking-wider">Admins</div>
              <div className="text-xl font-bold font-serif text-[#1E1B18]">{adminCount}</div>
            </div>
          </div>

          {/* Editors */}
          <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E9D5FF] flex items-center justify-center text-[#7E22CE] shadow-2xs">
              <BookOpen className="w-5 h-5 text-[#7E22CE]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#7E22CE] uppercase tracking-wider">Editors</div>
              <div className="text-xl font-bold font-serif text-[#1E1B18]">{editorCount}</div>
            </div>
          </div>

          {/* Authors & Contributors */}
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#BBF7D0] flex items-center justify-center text-[#047857] shadow-2xs">
              <Feather className="w-5 h-5 text-[#047857]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#047857] uppercase tracking-wider">Authors &amp; Subs</div>
              <div className="text-xl font-bold font-serif text-[#1E1B18]">{authorContributorCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EDE7DF] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8477] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members by name or email address..."
            className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8477] hover:text-[#1E1B18]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'admin', 'editor', 'author', 'contributor'] as const).map((r) => {
            const active = roleFilter === r;
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer capitalize ${
                  active
                    ? 'bg-[#E8734A] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#554E42] border border-[#DDD7CD] hover:border-[#E8734A]'
                }`}
              >
                {r === 'all' ? 'All Roles' : ROLE_DEFINITIONS[r].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#F0ECE6] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Team Member Directory</h3>
            <span className="text-xs text-[#8C8477]">
              Showing {filteredUsers.length} of {totalUsers} accounts
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#E8734A] border-t-transparent animate-spin mx-auto" />
            <p className="font-serif text-xs text-[#8C8477] italic">Loading team members...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#DDD7CD] flex items-center justify-center mx-auto text-[#8C8477]">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#1E1B18]">No team members found</h4>
            <p className="text-xs text-[#8C8477] max-w-sm mx-auto">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your search query or role filter.'
                : 'Click "+ Add New Member" above to create your first additional team account.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EAE5DF] text-[11px] font-bold text-[#8C8477] uppercase tracking-wider">
                  <th className="py-3.5 px-6">User / Identity</th>
                  <th className="py-3.5 px-4">Role &amp; Access</th>
                  <th className="py-3.5 px-4 text-center">Stories</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE6] text-xs">
                {filteredUsers.map((u) => {
                  const roleDef = ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.author;
                  const RoleIcon = roleDef.icon;
                  const isCurrentAuthUser = currentUser?.id === u.id || currentUser?.email === u.email;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[#FAF8F5]/80 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-10 h-10 rounded-full object-cover border border-[#DDD7CD] shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E8734A] to-[#FF9B73] text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Active" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1E1B18] text-sm group-hover:text-[#E8734A] transition-colors">
                                {u.name}
                              </span>
                              {isCurrentAuthUser && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8734A] text-white uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#8C8477] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#B0A89C]" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${roleDef.badgeBg} ${roleDef.badgeText} ${roleDef.badgeBorder} shadow-2xs`}
                          >
                            <RoleIcon className="w-3.5 h-3.5" />
                            <span>{roleDef.label}</span>
                          </span>
                          <span className="text-[10px] text-[#8C8477] line-clamp-1 max-w-[200px]">
                            {roleDef.summary}
                          </span>
                        </div>
                      </td>

                      {/* Stories Count */}
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE5DF] font-bold text-[#1E1B18] text-xs">
                          {u.articlesCount || 0}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-[#7A7468]">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3 h-3 text-[#A8A196]" />
                          <span>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Nov 2026'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Password */}
                          <button
                            type="button"
                            onClick={() => openPasswordModal(u)}
                            className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF5EF] text-[#554E42] hover:text-[#E8734A] border border-[#DDD7CD] hover:border-[#E8734A] transition-all cursor-pointer shadow-2xs"
                            title="Change / Reset Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details & Role */}
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF5EF] text-[#554E42] hover:text-[#E8734A] border border-[#DDD7CD] hover:border-[#E8734A] transition-all cursor-pointer shadow-2xs"
                            title="Edit Profile & Role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={isCurrentAuthUser || (u.role === 'admin' && adminCount <= 1)}
                            onClick={() => openDeleteModal(u)}
                            className={`p-2 rounded-xl border transition-all ${
                              isCurrentAuthUser || (u.role === 'admin' && adminCount <= 1)
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                                : 'bg-[#FAF8F5] hover:bg-red-50 text-[#554E42] hover:text-red-600 border-[#DDD7CD] hover:border-red-300 cursor-pointer shadow-2xs'
                            }`}
                            title={
                              isCurrentAuthUser
                                ? 'Cannot delete your own account'
                                : u.role === 'admin' && adminCount <= 1
                                ? 'Cannot delete the only remaining admin'
                                : 'Delete User Account'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL 1: ADD NEW USER
          ===================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EDE7DF] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8734A] block">
                  New Team Member
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#1E1B18] mt-0.5">
                  Create User Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-[#8C8477] hover:text-[#1E1B18] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#554E42] block">
                  Full Name <span className="text-[#E8734A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rossi"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#554E42] block">
                  Email Address <span className="text-[#E8734A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="elena@toufiqmotion.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#554E42]">
                    Password <span className="text-[#E8734A]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = generateRandomPassword();
                      setAddForm({ ...addForm, password: gen });
                      setShowAddPassword(true);
                    }}
                    className="text-[11px] font-bold text-[#E8734A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8477] hover:text-[#1E1B18]"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#554E42] block">
                  Select User Role &amp; Access Level <span className="text-[#E8734A]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['admin', 'editor', 'author', 'contributor'] as const).map((r) => {
                    const def = ROLE_DEFINITIONS[r];
                    const isSelected = addForm.role === r;
                    const Icon = def.icon;

                    return (
                      <div
                        key={r}
                        onClick={() => setAddForm({ ...addForm, role: r })}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#E8734A] bg-[#FFF9F5] shadow-2xs'
                            : 'border-[#EAE5DF] bg-[#FAF8F5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${def.badgeBg} ${def.badgeText} ${def.badgeBorder}`}>
                            <Icon className="w-3 h-3" />
                            <span>{def.label}</span>
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#E8734A]" />}
                        </div>
                        <p className="text-[11px] text-[#7A7468] mt-1 line-clamp-2 leading-relaxed">
                          {def.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Upload / URL */}
              <div className="space-y-2 pt-2 border-t border-[#F0ECE6]">
                <label className="text-xs font-bold text-[#554E42] block">
                  Author Avatar Photo (Optional)
                </label>
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-full border border-[#DDD7CD] bg-[#FAF8F5] overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                    {addForm.avatar ? (
                      <img
                        src={addForm.avatar}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-[#A8A196]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget('add');
                          setIsMediaPickerOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#FFF5EF] border border-[#FFCEBA] hover:bg-[#FFEADA] text-[#C85228] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#E8734A]" />
                        <span>Select from Media Library</span>
                      </button>

                      <label className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] text-[#1E1B18] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-[#E8734A]" />
                        <span>{isUploadingAddAvatar ? 'Uploading...' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAddAvatarUpload}
                          className="hidden"
                          disabled={isUploadingAddAvatar}
                        />
                      </label>

                      {addForm.avatar && (
                        <button
                          type="button"
                          onClick={() => setAddForm((prev) => ({ ...prev, avatar: '' }))}
                          className="px-2.5 py-2 text-[11px] text-red-600 hover:text-red-700 hover:underline font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={addForm.avatar}
                      onChange={(e) => setAddForm({ ...addForm, avatar: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-3 py-1.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0ECE6]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDD7CD] bg-[#FAF8F5] hover:bg-white text-xs font-bold text-[#554E42] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#E8734A] hover:bg-[#D5623A] text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: EDIT USER DETAILS & ROLE
          ===================================================================== */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EDE7DF] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8734A] block">
                  Modify Account
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#1E1B18] mt-0.5">
                  Edit Profile &amp; Role
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-[#8C8477] hover:text-[#1E1B18] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#554E42] block">
                  Full Name <span className="text-[#E8734A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#554E42] block">
                  Email Address <span className="text-[#E8734A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#554E42] block">
                  Assigned Role &amp; Permissions <span className="text-[#E8734A]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['admin', 'editor', 'author', 'contributor'] as const).map((r) => {
                    const def = ROLE_DEFINITIONS[r];
                    const isSelected = editForm.role === r;
                    const Icon = def.icon;

                    return (
                      <div
                        key={r}
                        onClick={() => setEditForm({ ...editForm, role: r })}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#E8734A] bg-[#FFF9F5] shadow-2xs'
                            : 'border-[#EAE5DF] bg-[#FAF8F5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${def.badgeBg} ${def.badgeText} ${def.badgeBorder}`}>
                            <Icon className="w-3 h-3" />
                            <span>{def.label}</span>
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#E8734A]" />}
                        </div>
                        <p className="text-[11px] text-[#7A7468] mt-1 line-clamp-2 leading-relaxed">
                          {def.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Upload / URL */}
              <div className="space-y-2 pt-2 border-t border-[#F0ECE6]">
                <label className="text-xs font-bold text-[#554E42] block">
                  Author Avatar Photo
                </label>
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-full border border-[#DDD7CD] bg-[#FAF8F5] overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                    {editForm.avatar ? (
                      <img
                        src={editForm.avatar}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-[#A8A196]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget('edit');
                          setIsMediaPickerOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#FFF5EF] border border-[#FFCEBA] hover:bg-[#FFEADA] text-[#C85228] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#E8734A]" />
                        <span>Select from Media Library</span>
                      </button>

                      <label className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] text-[#1E1B18] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-[#E8734A]" />
                        <span>{isUploadingEditAvatar ? 'Uploading...' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditAvatarUpload}
                          className="hidden"
                          disabled={isUploadingEditAvatar}
                        />
                      </label>

                      {editForm.avatar && (
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, avatar: '' }))}
                          className="px-2.5 py-2 text-[11px] text-red-600 hover:text-red-700 hover:underline font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-3 py-1.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0ECE6]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDD7CD] bg-[#FAF8F5] hover:bg-white text-xs font-bold text-[#554E42] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#E8734A] hover:bg-[#D5623A] text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: CHANGE PASSWORD
          ===================================================================== */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EDE7DF] max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8734A] block">
                  Security &bull; Credentials
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#1E1B18] mt-0.5">
                  Change Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-2 rounded-xl text-[#8C8477] hover:text-[#1E1B18] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target User Banner */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] flex items-center gap-3">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#DDD7CD]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#E8734A] text-white font-bold flex items-center justify-center text-xs">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-[#1E1B18] text-xs truncate">{selectedUser.name}</div>
                <div className="text-[11px] text-[#8C8477] truncate">{selectedUser.email}</div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#554E42]">New Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = generateRandomPassword();
                      setPasswordForm({ password: gen, confirmPassword: gen });
                      setShowNewPassword(true);
                    }}
                    className="text-[11px] font-bold text-[#E8734A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Generate Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter new password (min. 6 characters)"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-4 py-2.5 pr-10 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8477] hover:text-[#1E1B18]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#554E42] block">Confirm New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FFF9F5] border border-[#FFCEBA] text-[11px] text-[#7A7468] leading-relaxed">
                💡 Password will be updated instantly. The user will use this new password on their next login to Toufiq Motion Studio.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0ECE6]">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#DDD7CD] bg-[#FAF8F5] hover:bg-white text-xs font-bold text-[#554E42] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#E8734A] hover:bg-[#D5623A] text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: DELETE CONFIRMATION
          ===================================================================== */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#EDE7DF] max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-serif font-bold text-xl text-[#1E1B18]">
                Remove User Account?
              </h3>
              <p className="text-xs text-[#7A7468] leading-relaxed">
                Are you sure you want to remove <strong>{selectedUser.name}</strong> ({selectedUser.email}) from Toufiq Motion? This action is permanent and removes their access to the studio.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#DDD7CD] bg-[#FAF8F5] hover:bg-white text-xs font-bold text-[#554E42] transition-colors cursor-pointer"
              >
                Keep Account
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteUser}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: MEDIA LIBRARY AVATAR PICKER
          ===================================================================== */}
      {isMediaPickerOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMediaPickerOpen(false);
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE7DF] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#E0DCD4] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8734A] block">
                  Media Assets &bull; Avatar Selection
                </span>
                <h3 className="font-serif font-bold text-xl text-[#1E1B18] mt-0.5">
                  Select User Avatar from Media Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all text-[#4A453E] shadow-xs cursor-pointer"
                title="Close Media Library"
              >
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-white">Close</span>
                <X className="w-3.5 h-3.5 group-hover:text-white" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6 grow">
              <MediaLibrary
                token={token}
                selectionMode={true}
                onSelectImage={(url) => {
                  if (mediaPickerTarget === 'add') {
                    setAddForm((prev) => ({ ...prev, avatar: url }));
                  } else {
                    setEditForm((prev) => ({ ...prev, avatar: url }));
                  }
                  setIsMediaPickerOpen(false);
                  showToast('success', 'Avatar image selected from Media Library');
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

