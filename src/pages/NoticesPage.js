import React, { useState, useEffect } from 'react';
import noticeService from '../services/noticeService';
import './CommonPage.css';
import '../components/Modal.css';

function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadNotices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await noticeService.getAll(page, 10);
      setNotices(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = async (id) => {
    try {
      const notice = await noticeService.getById(id);
      setSelectedNotice(notice);
      setShowModal(true);
    } catch (err) {
      alert('공지사항을 불러오는데 실패했습니다');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotice(null);
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await noticeService.delete(id);
      loadNotices();
    } catch (err) {
      alert('삭제에 실패했습니다');
    }
  };

  const handleTogglePin = async (id, event) => {
    event.stopPropagation();
    try {
      await noticeService.togglePin(id);
      loadNotices();
    } catch (err) {
      alert('상단 고정 변경에 실패했습니다');
    }
  };

  if (loading) return <div className="loading">로딩중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>공지사항</h1>
        <button className="btn-primary">새 공지사항 작성</button>
      </div>

      <div className="list-container">
        {notices.length === 0 ? (
          <p className="empty-message">공지사항이 없습니다</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>작성자</th>
                <th>조회수</th>
                <th>작성일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr
                  key={notice.id}
                  className={notice.isPinned ? 'pinned' : ''}
                  onClick={() => handleNoticeClick(notice.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{notice.id}</td>
                  <td>
                    {notice.isPinned && <span className="pin-badge">고정</span>}
                    {notice.title}
                  </td>
                  <td>{notice.author?.name}</td>
                  <td>{notice.viewCount}</td>
                  <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-sm"
                      onClick={(e) => handleTogglePin(notice.id, e)}
                    >
                      {notice.isPinned ? '고정 해제' : '고정'}
                    </button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={(e) => handleDelete(notice.id, e)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            이전
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            다음
          </button>
        </div>
      )}

      {/* 상세 모달 */}
      {showModal && selectedNotice && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNotice.title}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <div className="modal-info-row">
                  <span className="modal-info-label">작성자:</span>
                  <span className="modal-info-value">{selectedNotice.author?.name || 'Unknown'}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">작성일:</span>
                  <span className="modal-info-value">{new Date(selectedNotice.createdAt).toLocaleString()}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">조회수:</span>
                  <span className="modal-info-value">{selectedNotice.viewCount}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">상태:</span>
                  <span className="modal-info-value">
                    {selectedNotice.isPinned && <span className="badge badge-pinned">상단 고정</span>}
                    {' '}
                    <span className="badge badge-active">{selectedNotice.status}</span>
                  </span>
                </div>
              </div>
              <div className="modal-content-text">
                {selectedNotice.content}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={handleCloseModal}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticesPage;
