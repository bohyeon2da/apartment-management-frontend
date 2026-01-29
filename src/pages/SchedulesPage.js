import React, { useState, useEffect } from 'react';
import scheduleService from '../services/scheduleService';
import './CommonPage.css';
import '../components/Modal.css';

function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await scheduleService.getAll();
      setSchedules(data);
    } catch (err) {
      setError('일정을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleClick = async (id) => {
    try {
      const schedule = await scheduleService.getById(id);
      setSelectedSchedule(schedule);
      setShowModal(true);
    } catch (err) {
      alert('일정을 불러오는데 실패했습니다');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await scheduleService.delete(id);
      loadSchedules();
    } catch (err) {
      alert('삭제에 실패했습니다');
    }
  };

  const handleStatusChange = async (id, newStatus, event) => {
    event.stopPropagation();
    try {
      await scheduleService.updateStatus(id, newStatus);
      loadSchedules();
    } catch (err) {
      alert('상태 변경에 실패했습니다');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      SCHEDULED: { text: '예정', class: 'status-pending' },
      IN_PROGRESS: { text: '진행중', class: 'status-in-progress' },
      COMPLETED: { text: '완료', class: 'status-completed' },
      CANCELLED: { text: '취소', class: 'status-rejected' },
    };
    const statusInfo = statusMap[status] || { text: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getTypeText = (type) => {
    const typeMap = {
      MEETING: '회의',
      INSPECTION: '점검',
      EVENT: '행사',
      MAINTENANCE: '보수',
      OTHER: '기타',
    };
    return typeMap[type] || type;
  };

  if (loading) return <div className="loading">로딩중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>일정 관리</h1>
        <button className="btn-primary">새 일정 등록</button>
      </div>

      <div className="list-container">
        {schedules.length === 0 ? (
          <p className="empty-message">등록된 일정이 없습니다</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>분류</th>
                <th>제목</th>
                <th>시작일시</th>
                <th>종료일시</th>
                <th>장소</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  onClick={() => handleScheduleClick(schedule.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{schedule.id}</td>
                  <td>{getTypeText(schedule.type)}</td>
                  <td>{schedule.title}</td>
                  <td>{new Date(schedule.startDate).toLocaleString()}</td>
                  <td>{new Date(schedule.endDate).toLocaleString()}</td>
                  <td>{schedule.location || '-'}</td>
                  <td>{getStatusBadge(schedule.status)}</td>
                  <td>
                    <select
                      value={schedule.status}
                      onChange={(e) => handleStatusChange(schedule.id, e.target.value, e)}
                      className="btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="SCHEDULED">예정</option>
                      <option value="IN_PROGRESS">진행중</option>
                      <option value="COMPLETED">완료</option>
                      <option value="CANCELLED">취소</option>
                    </select>
                    <button
                      className="btn-sm btn-danger"
                      onClick={(e) => handleDelete(schedule.id, e)}
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

      {/* 상세 모달 */}
      {showModal && selectedSchedule && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSchedule.title}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <div className="modal-info-row">
                  <span className="modal-info-label">분류:</span>
                  <span className="modal-info-value">{getTypeText(selectedSchedule.type)}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">시작일시:</span>
                  <span className="modal-info-value">{new Date(selectedSchedule.startDate).toLocaleString()}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">종료일시:</span>
                  <span className="modal-info-value">{new Date(selectedSchedule.endDate).toLocaleString()}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">장소:</span>
                  <span className="modal-info-value">{selectedSchedule.location || '-'}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">작성자:</span>
                  <span className="modal-info-value">{selectedSchedule.creator?.name || 'Unknown'}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">작성일:</span>
                  <span className="modal-info-value">{new Date(selectedSchedule.createdAt).toLocaleString()}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">상태:</span>
                  <span className="modal-info-value">{getStatusBadge(selectedSchedule.status)}</span>
                </div>
              </div>
              {selectedSchedule.description && (
                <div>
                  <h3>상세 설명</h3>
                  <div className="modal-content-text">
                    {selectedSchedule.description}
                  </div>
                </div>
              )}
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

export default SchedulesPage;
