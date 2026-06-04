import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://digiram-pjd6-production.up.railway.app';

const rolePermissions: Record<string, { label: string; allowed: boolean }[]> = {
  hospital: [
    { label: 'Mengisi penilaian mandiri EMRAM', allowed: true },
    { label: 'Melihat beranda & metrik faskes', allowed: true },
    { label: 'Mengunggah dokumen pendukung', allowed: true },
    { label: 'Melihat riwayat penilaian', allowed: true },
    { label: 'Verifikasi penilaian faskes lain', allowed: false },
    { label: 'Akses data tingkat regional', allowed: false },
    { label: 'Validasi final (Dinkes)', allowed: false },
  ],
  health_office: [
    { label: 'Melihat beranda regional', allowed: true },
    { label: 'Verifikasi penilaian faskes', allowed: true },
    { label: 'Memberi komentar & catatan tinjauan', allowed: true },
    { label: 'Melihat peta kesiapan regional', allowed: true },
    { label: 'Ekspor laporan regional', allowed: true },
  ],
  ministry: [
    { label: 'Akses penuh semua beranda', allowed: true },
    { label: 'Validasi final penilaian', allowed: true },
    { label: 'Manajemen pengguna & peran', allowed: true },
    { label: 'Konfigurasi instrumen EMRAM', allowed: true },
    { label: 'Akses data tingkat nasional', allowed: true },
    { label: 'Ekspor & cetak laporan nasional', allowed: true },
    { label: 'Audit trail & log aktivitas', allowed: true },
  ],
};

const roleLabel: Record<string, string> = {
  hospital: 'Staf Rumah Sakit',
  health_office: 'Admin Dinas Kesehatan',
  ministry: 'Admin Pusat · Kemenkes',
};

const roleBadgeClass: Record<string, string> = {
  hospital: 'stage-s3',
  health_office: 'stage-s5',
  ministry: 'stage-s7',
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  readOnly?: boolean;
}

function Field({ label, value, onChange, type = 'text', placeholder, required, hint, readOnly }: FieldProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text2)', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: '8px',
          border: '1px solid var(--border2)',
          background: readOnly ? 'var(--surface2)' : 'var(--surface)',
          fontSize: '13px',
          color: readOnly ? 'var(--text3)' : 'var(--text)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          outline: 'none', boxSizing: 'border-box' as const,
          cursor: readOnly ? 'not-allowed' : 'text',
        }}
      />
      {hint && <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{hint}</p>}
    </div>
  );
}

interface PengaturanAksesProps {
  onLogout: () => void;
}

export function PengaturanAkses({ onLogout }: PengaturanAksesProps) {
  const { user, updateUser } = useAuth();

  const [nama, setNama]         = useState(user?.name || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [jabatan, setJabatan]   = useState('Kepala Instalasi RME');
  const [noTelp, setNoTelp]     = useState('+62 812 3456 7890');
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');

  // Password state
  const [passMode, setPassMode]             = useState<'idle' | 'form'>('idle');
  const [passLama, setPassLama]             = useState('');
  const [passBaru, setPassBaru]             = useState('');
  const [passKonfirmasi, setPassKonfirmasi] = useState('');
  const [passSaved, setPassSaved]           = useState(false);
  const [passError, setPassError]           = useState('');

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Simpan profil ke backend, lalu update context & sidebar
  const handleSaveProfil = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError('');

    try {
      const token = localStorage.getItem('digiram_token');
      const res = await fetch(`${API_URL}/api/user/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: nama,
          email,
          jabatan,
          no_telp: noTelp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.message || 'Gagal menyimpan profil.');
        return;
      }

      // Update AuthContext + localStorage agar sidebar ikut berubah
      if (data.user) {
        updateUser({
          name:          data.user.name,
          email:         data.user.email,
          hospital_data: data.user.hospital_data,
          organizationName: data.user.hospital_data?.name ?? user?.organizationName,
        });
        setNama(data.user.name);
        setEmail(data.user.email);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setSaving(false);
    }
  };

  const handleClickPerbarui = () => {
    if (passMode === 'idle') {
      setPassMode('form');
      return;
    }
    if (!passLama) { setPassError('Masukkan kata sandi saat ini.'); return; }
    if (passBaru.length < 8) { setPassError('Kata sandi baru minimal 8 karakter.'); return; }
    if (passBaru !== passKonfirmasi) { setPassError('Konfirmasi kata sandi tidak cocok.'); return; }
    setPassError('');
    setPassSaved(true);
    setPassLama(''); setPassBaru(''); setPassKonfirmasi('');
    setPassMode('idle');
    setTimeout(() => setPassSaved(false), 2500);
  };

  const handleBatalPass = () => {
    setPassMode('idle');
    setPassLama(''); setPassBaru(''); setPassKonfirmasi('');
    setPassError('');
  };

  const permissions = rolePermissions[user?.role || 'hospital'] || [];

  return (
    <div>
      <div className="page-content">
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            Pengaturan Akses
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
            Kelola profil, keamanan akun, dan lihat hak akses Anda di sistem DIGIRAM
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* LEFT */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Profil Pengguna */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px' }}>👤</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Profil Pengguna</span>
              </div>
              <div style={{ padding: '20px' }}>
                {/* Avatar row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--accent)', color: 'white', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {(nama || user?.name || 'U').split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    {/* Nama ditampilkan secara real-time sesuai input */}
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{nama || user?.name}</div>
                    <span className={`stage-badge ${roleBadgeClass[user?.role || 'hospital']}`}>
                      {roleLabel[user?.role || 'hospital']}
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <button className="simari-btn simari-btn-outline" style={{ fontSize: '12px' }}>Ganti Foto</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <Field label="Nama Lengkap" value={nama} onChange={setNama} required placeholder="Nama lengkap" />
                  <Field label="Email" value={email} onChange={setEmail} type="email" required placeholder="email@faskes.go.id" />
                  <Field label="Jabatan / Posisi" value={jabatan} onChange={setJabatan} placeholder="cth. Kepala Instalasi RME" />
                  <Field label="No. Telepon" value={noTelp} onChange={setNoTelp} type="tel" placeholder="+62 8xx xxxx xxxx" />
                </div>
                <Field
                  label="Organisasi"
                  value={user?.hospital_data?.name || user?.hospital || user?.organizationName || '—'}
                  onChange={() => {}}
                  readOnly
                  hint="Organisasi dikelola oleh administrator sistem. Hubungi admin untuk perubahan."
                />

                {saveError && (
                  <p style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '12px', padding: '8px 12px', background: 'var(--danger-light)', borderRadius: '6px' }}>
                    ⚠ {saveError}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className="simari-btn simari-btn-primary"
                    onClick={handleSaveProfil}
                    disabled={saving}
                    style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'wait' : 'pointer' }}
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  {saved && <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>✓ Profil berhasil disimpan</span>}
                </div>
              </div>
            </div>

            {/* Keamanan Akun */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px' }}>🔒</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Keamanan Akun</span>
              </div>
              <div style={{ padding: '20px' }}>
                <Field label="Kata Sandi Saat Ini" value={passLama} onChange={setPassLama} type="password" placeholder="••••••••" />

                {passMode === 'form' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <Field label="Kata Sandi Baru" value={passBaru} onChange={setPassBaru} type="password" placeholder="Min. 8 karakter" />
                    <Field label="Konfirmasi Kata Sandi Baru" value={passKonfirmasi} onChange={setPassKonfirmasi} type="password" placeholder="Ulangi kata sandi baru" />
                  </div>
                )}

                {passError && (
                  <p style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '12px', padding: '8px 12px', background: 'var(--danger-light)', borderRadius: '6px' }}>
                    ⚠ {passError}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button className="simari-btn simari-btn-outline" onClick={handleClickPerbarui}>
                    {passMode === 'idle' ? 'Perbarui Kata Sandi' : 'Simpan Kata Sandi Baru'}
                  </button>
                  {passMode === 'form' && (
                    <button className="simari-btn simari-btn-ghost" onClick={handleBatalPass}>Batal</button>
                  )}
                  {passSaved && <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>✓ Kata sandi berhasil diperbarui</span>}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Akses & Hak */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Akses & Hak Pengguna</span>
                <span className={`stage-badge ${roleBadgeClass[user?.role || 'hospital']}`}>
                  {user?.role === 'hospital' ? 'RS' : user?.role === 'health_office' ? 'Dinkes' : 'Kemenkes'}
                </span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Hak Akses</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {permissions.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, background: p.allowed ? 'var(--accent-light)' : 'var(--surface2)', color: p.allowed ? 'var(--accent)' : 'var(--text3)', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.allowed ? '✓' : '✕'}
                      </span>
                      <span style={{ fontSize: '12px', color: p.allowed ? 'var(--text)' : 'var(--text3)' }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sesi Aktif */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Sesi Aktif</span>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Status', value: '● Aktif', color: 'var(--accent)' },
                  { label: 'Masuk terakhir', value: 'Hari ini, 08:34 WIB', color: 'var(--text)' },
                  { label: 'Perangkat', value: 'Chrome · Windows', color: 'var(--text)' },
                  { label: 'IP Address', value: '103.xx.xx.xx', color: 'var(--text3)' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 16px 14px' }}>
                {!showLogoutConfirm ? (
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget).style.background = 'var(--danger-light)'; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.background = 'transparent'; }}
                  >
                    Keluar dari Sistem
                  </button>
                ) : (
                  <div style={{ background: 'var(--danger-light)', borderRadius: '8px', padding: '12px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px' }}>Yakin ingin keluar?</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={onLogout} style={{ flex: 1, padding: '7px', borderRadius: '6px', border: 'none', background: 'var(--danger)', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Ya, Keluar
                      </button>
                      <button onClick={() => setShowLogoutConfirm(false)} className="simari-btn simari-btn-outline" style={{ padding: '7px 10px', fontSize: '12px' }}>
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Akun */}
            <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>ℹ Informasi Akun</div>
              <p style={{ fontSize: '11px', color: 'var(--accent2)', lineHeight: 1.6, margin: 0 }}>
                Role dan organisasi Anda dikelola oleh administrator sistem. Untuk perubahan role atau organisasi, hubungi <strong>admin DIGIRAM</strong> di instansi Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
