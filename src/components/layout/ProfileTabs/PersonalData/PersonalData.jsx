import React, { useState, useEffect } from 'react';
import { patchUser } from '../../../../api/User/patchUser';
import { FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaStar } from 'react-icons/fa';
import './PersonalData.css';

const PersonalData = ({ userData, setUserData, setError, setSuccessMessage, refreshProfile }) => {
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    address: '',
    passport_number: '',
  });

  useEffect(() => {
    if (userData) {
      setForm({
        first_name: userData.first_name ?? '',
        last_name: userData.last_name ?? '',
        middle_name: userData.middle_name ?? '',
        date_of_birth: formatDateForInput(userData.date_of_birth) ?? '',
        address: userData.address ?? '',
        passport_number: userData.passport_number ?? '',
      });
    }
  }, [userData]);

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return d;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const maskSensitiveData = (data, visibleChars = 4) => {
    if (!data || data.length <= visibleChars) return data;
    return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setPassword('');
    setShowPassword(false);
    setError('');
    setSuccessMessage('');
    
    if (userData) {
      setForm({
        first_name: userData.first_name ?? '',
        last_name: userData.last_name ?? '',
        middle_name: userData.middle_name ?? '',
        date_of_birth: formatDateForInput(userData.date_of_birth) ?? '',
        address: userData.address ?? '',
        passport_number: userData.passport_number ?? '',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    if (!userData) return;

    if (!password.trim()) {
      setError('Пожалуйста, введите ваш пароль для подтверждения изменений');
      setSaving(false);
      return;
    }

    try {
      const updatesWithPassword = {
        ...form,
        password: password
      };

      await patchUser(updatesWithPassword, userData);
      
      await refreshProfile();
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setEditMode(false);
      setPassword('');
      setShowPassword(false);
    } catch (e) {
      setError(e.message || 'Ошибка сохранения');
      console.error('Ошибка сохранения:', e);
    } finally {
      setSaving(false);
    }
  };

  const hasFieldData = (f) =>
    userData && userData[f] !== undefined && userData[f] !== null && userData[f] !== '';

  return (
    <div className="profile-details">
      <div className="content-header">
        <h2>Личные данные</h2>
        {!editMode && (
          <button
            className="btn btn-edit"
            onClick={() => setEditMode(true)}
            disabled={saving}
          >
            <FaEdit className="edit-icon" />
            <span>Редактировать</span>
          </button>
        )}
        {editMode && (
          <div className="edit-actions">
            <button 
              className="btn btn-cancel"
              onClick={cancelEdit}
              disabled={saving}
            >
              <FaTimes className="cancel-icon" />
              <span>Отмена</span>
            </button>
            <button 
              className="btn btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave className="save-icon" />
              <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
            </button>
          </div>
        )}
      </div>

      {editMode && (
        <div className="password-section">
          <h3>Подтверждение пароля</h3>
          <p className="password-note">
            Для сохранения изменений необходимо подтвердить ваш пароль
          </p>
          <div className="password-input-container">
            <label htmlFor="password">Текущий пароль *</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="edit-input"
                placeholder="Введите ваш пароль"
                disabled={saving}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={saving}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="detail-section">
        <h3>Основная информация</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Email</label>
            <div className="detail-value non-editable">{userData?.email || '—'}</div>
          </div>

          <div className="detail-item">
            <label>Имя *</label>
            {editMode ? (
              <input
                className="edit-input"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                disabled={saving}
                required
              />
            ) : (
              <div className="detail-value">{userData?.first_name || '—'}</div>
            )}
          </div>

          <div className="detail-item">
            <label>Фамилия *</label>
            {editMode ? (
              <input
                className="edit-input"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                disabled={saving}
                required
              />
            ) : (
              <div className="detail-value">{userData?.last_name || '—'}</div>
            )}
          </div>

          <div className="detail-item">
            <label>Отчество</label>
            {editMode ? (
              <input
                className="edit-input"
                value={form.middle_name}
                onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                disabled={saving}
              />
            ) : (
              <div className="detail-value">{userData?.middle_name || '—'}</div>
            )}
          </div>

          <div className="detail-item">
            <label>Дата рождения *</label>
            {editMode ? (
              <input
                type="date"
                className="edit-input"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                disabled={saving}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            ) : (
              <div className="detail-value">{formatDate(userData?.date_of_birth) || '—'}</div>
            )}
          </div>

          <div className="detail-item">
            <label>Номер паспорта *</label>
            {editMode ? (
              <input
                className="edit-input"
                value={form.passport_number}
                onChange={(e) => setForm({ ...form, passport_number: e.target.value })}
                disabled={saving}
                required
              />
            ) : (
              <div className="detail-value">
                {userData?.passport_number ? 
                  maskSensitiveData(userData.passport_number, 4) : 
                  '—'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Дополнительная информация</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Адрес</label>
            {editMode ? (
              <textarea
                className="edit-input textarea"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={saving}
                rows="3"
              />
            ) : (
              <div className="detail-value">{userData?.address || '—'}</div>
            )}
          </div>
        </div>
      </div>

      {editMode && (
        <div className="required-fields-note">
          <p><span className="required-star">*</span> - обязательные поля</p>
        </div>
      )}
    </div>
  );
};

export default PersonalData;