import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import './Form.css'; // Kita pakai style yang sama

const ProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    no_hp: '',
    // Dapur-specific fields
    nama_dapur: '',
    alamat: '',
    deskripsi: '',
  });

  // Ambil data profil saat halaman dimuat
  useEffect(() => {
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || '',
        no_hp: user.no_hp || '',
        nama_dapur: user.Dapur?.nama_dapur || '',
        alamat: user.Dapur?.alamat || '',
        deskripsi: user.Dapur?.deskripsi || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/api/profile`, formData, config);
      updateUser(data); // Update data di context agar nama di navigasi ikut berubah
      showNotification('Profil berhasil diperbarui!', 'success');
    } catch (error) {
      showNotification('Gagal memperbarui profil.', 'error');
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Profil Saya</h2>
        {/* Kolom untuk semua user */}
        <div className="form-group">
          <label>Nama Lengkap</label>
          <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Nomor Handphone</label>
          <input type="tel" name="no_hp" value={formData.no_hp} onChange={handleInputChange} />
        </div>

        {/* Kolom khusus untuk Dapur */}
        {user.role === 'dapur' && (
          <>
            <hr />
            <h3>Info Dapur</h3>
            <div className="form-group">
              <label>Nama Dapur</label>
              <input type="text" name="nama_dapur" value={formData.nama_dapur} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Alamat</label>
              <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} style={{minHeight: '80px'}}/>
            </div>
            <div className="form-group">
              <label>Deskripsi Dapur</label>
              <textarea name="deskripsi" value={formData.deskripsi} onChange={handleInputChange} style={{minHeight: '120px'}}/>
            </div>
          </>
        )}

        <button type="submit">Simpan Perubahan</button>
      </form>
    </div>
  );
};

export default ProfilePage;
