/**
 * InterestsTab Component - Tab hiển thị và quản lý sở thích
 */

const InterestsTab = ({
  selectedInterests = [],
  setSelectedInterests = () => {},
  popularTags = [],
  newTagInput = '',
  setNewTagInput = () => {},
  error = '',
  setError = () => {},
  success = '',
  loading = false,
  handleSubmit = () => {}
}) => {
  const toggleInterest = (tag) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(i => i !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
    setError('');
  };

  const addCustomTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (selectedInterests.length >= 12) {
      setError('Tối đa 12 sở thích');
      return;
    }
    if (selectedInterests.includes(trimmed)) {
      setError('Sở thích đã tồn tại');
      return;
    }
    setSelectedInterests([...selectedInterests, trimmed]);
    setNewTagInput('');
    setError('');
  };

  const removeInterest = (tag) => {
    setSelectedInterests(selectedInterests.filter(i => i !== tag));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Selected interests */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #fce7f3',
        padding: 20,
        boxShadow: '0 2px 12px rgba(244,63,94,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
            Sở thích đã chọn
          </h3>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            {selectedInterests.length}/12
          </span>
        </div>

        {selectedInterests.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>
            Chưa có sở thích nào được chọn
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedInterests.map((tag, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #fff0f6, #fdf4ff)',
                  color: '#f43f5e',
                  border: '1px solid #fce7f3',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => removeInterest(tag)}
                title="Nhấn để xóa"
              >
                {tag}
                <svg width="12" height="12" fill="none" stroke="#f43f5e" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Popular tags */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #fce7f3',
        padding: 20,
        boxShadow: '0 2px 12px rgba(244,63,94,0.06)'
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          💡 Gợi ý sở thích phổ biến
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {popularTags.map((tag, i) => (
            <button
              key={i}
              onClick={() => toggleInterest(tag)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: selectedInterests.includes(tag)
                  ? '1.5px solid #f43f5e'
                  : '1px solid #e5e7eb',
                background: selectedInterests.includes(tag)
                  ? 'linear-gradient(135deg, #fff0f6, #fdf4ff)'
                  : '#f9fafb',
                color: selectedInterests.includes(tag)
                  ? '#f43f5e'
                  : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {selectedInterests.includes(tag) && '✓ '}
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Custom tag input */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #fce7f3',
        padding: 20,
        boxShadow: '0 2px 12px rgba(244,63,94,0.06)'
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
          ✏️ Thêm sở thích tùy chỉnh
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
            placeholder="Nhập sở thích của bạn..."
            maxLength={30}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: '1.5px solid #fce7f3',
              fontSize: 13,
              outline: 'none',
              background: '#fff9fb'
            }}
          />
          <button
            onClick={addCustomTag}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #fb7185, #f43f5e)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Thêm
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          fontSize: 13
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#16a34a',
          fontSize: 13
        }}>
          ✅ {success}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '14px 0',
          borderRadius: 14,
          background: loading
            ? '#f9fafb'
            : 'linear-gradient(135deg, #fb7185, #f43f5e)',
          color: loading ? '#9ca3af' : '#fff',
          fontSize: 14,
          fontWeight: 700,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading
            ? 'none'
            : '0 4px 14px rgba(244,63,94,0.3)'
        }}
      >
        {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
      </button>
    </div>
  );
};

export default InterestsTab;
