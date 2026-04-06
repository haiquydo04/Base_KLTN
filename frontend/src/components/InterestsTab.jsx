import React from 'react';
import { Link } from 'react-router-dom';

const InterestsTab = ({
  selectedInterests,
  setSelectedInterests,
  popularTags,
  newTagInput,
  setNewTagInput,
  error,
  setError,
  success,
  loading,
  handleSubmit
}) => {
  const CARD = { background: '#fff', borderRadius: 16, border: '1px solid #fce7f3', boxShadow: '0 2px 12px rgba(244,63,94,0.06)' };
  const INPUT = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: '1.5px solid #fce7f3', fontSize: 13, color: '#374151',
    background: '#fff9fb', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .2s',
  };

  const handleToggleTag = (tag) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(t => t !== tag));
    } else {
      if (selectedInterests.length >= 10) {
        setError('Chỉ được chọn tối đa 10 sở thích.');
        return;
      }
      setSelectedInterests([...selectedInterests, tag]);
      setError('');
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (!tag) return;
    if (selectedInterests.includes(tag)) {
      setError('Sở thích này đã được chọn.');
      return;
    }
    if (selectedInterests.length >= 10) {
      setError('Chỉ được chọn tối đa 10 sở thích.');
      return;
    }
    setSelectedInterests([...selectedInterests, tag]);
    setNewTagInput('');
    setError('');
  };

  const predefinedTags = popularTags || ['Thể thao', 'Game', 'Leo núi', 'Chụp ảnh', 'Đọc sách', 'Cà phê', 'Thú cưng', 'Vẽ tranh', 'Tình nguyện'];

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0 w-full">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
          Sở thích & Đam mê
        </h1>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
          Thêm các sở thích để tìm kiếm những người có cùng điểm chung 💕
        </p>
      </div>

      <div style={{ ...CARD, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Đã chọn ({selectedInterests.length}/10)</h2>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Chưa có sở thích nào được chọn.</p>
            ) : (
              selectedInterests.map(tag => (
                <span key={tag} onClick={() => handleToggleTag(tag)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, background: 'linear-gradient(135deg,#fb7185,#f43f5e)',
                    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(244,63,94,0.3)'
                  }}>
                  {tag} <span style={{ fontSize: 10, opacity: 0.8 }}>✕</span>
                </span>
              ))
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #fce7f3', margin: '4px 0' }} />

        <div>
           <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Gợi ý phổ biến</h2>
           <div className="flex flex-wrap gap-2">
            {predefinedTags.filter(t => !selectedInterests.includes(t)).map(tag => (
              <span key={tag} onClick={() => handleToggleTag(tag)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: '1.5px solid #fce7f3',
                  background: '#fff9fb', color: '#f43f5e', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all .2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fdf2f8'; e.currentTarget.style.borderColor = '#fbcfe8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff9fb'; e.currentTarget.style.borderColor = '#fce7f3'; }}
              >
                + {tag}
              </span>
            ))}
           </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #fce7f3', margin: '4px 0' }} />

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Thêm sở thích khác</h2>
          <form onSubmit={handleAddCustomTag} className="flex gap-2">
            <input 
              style={{ ...INPUT, flex: 1 }}
              placeholder="Nhập sở thích và ấn Enter..."
              value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#f43f5e'}
              onBlur={e => e.target.style.borderColor = '#fce7f3'}
            />
            <button type="submit"
              disabled={!newTagInput.trim()}
              style={{
                padding: '0 20px', borderRadius: 12, border: 'none',
                background: newTagInput.trim() ? '#f43f5e' : '#fce7f3',
                color: newTagInput.trim() ? '#fff' : '#9ca3af',
                fontSize: 13, fontWeight: 700, cursor: newTagInput.trim() ? 'pointer' : 'not-allowed',
                transition: 'all .2s'
              }}>
              Thêm
            </button>
          </form>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 12, fontSize: 12, color: '#ef4444' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, fontSize: 12, color: '#16a34a' }}>
            ✅ {success}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #fce7f3', margin: '4px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <Link to="/profile"
            style={{
              padding: '12px 28px', borderRadius: 28, border: '1.5px solid #fca5a5',
              background: '#fff', color: '#f43f5e', fontSize: 13, fontWeight: 700,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', transition: 'all .2s',
            }}>
            Hủy &nbsp;✕
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '12px 36px', borderRadius: 28, border: 'none',
              background: loading ? '#fca5a5' : 'linear-gradient(135deg,#fb7185,#f43f5e)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(244,63,94,0.35)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'all .2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? '⏳ Đang lưu...' : '✅ Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestsTab;
