import React, { useState, useEffect } from 'react';
import complaintService from '../services/complaintService';
import './CommonPage.css';
import '../components/Modal.css';

function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [page, statusFilter]);

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getAll(statusFilter, page, 10);
      setComplaints(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('민원을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintClick = async (id) => {
    try {
      const complaint = await complaintService.getById(id);
      setSelectedComplaint(complaint);
      setShowModal(true);
      loadComments(id);
    } catch (err) {
      alert('민원을 불러오는데 실패했습니다');
    }
  };

  const loadComments = async (complaintId) => {
    try {
      const data = await complaintService.getComments(complaintId);
      setComments(data);
    } catch (err) {
      console.error('댓글을 불러오는데 실패했습니다', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요');
      return;
    }

    try {
      await complaintService.createComment(selectedComplaint.id, {
        content: newComment,
        isInternal: false
      });
      setNewComment('');
      loadComments(selectedComplaint.id);
    } catch (err) {
      alert('댓글 작성에 실패했습니다');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    setComments([]);
    setNewComment('');
  };

  const handleStatusChange = async (id, newStatus, event) => {
    event.stopPropagation();
    try {
      await complaintService.updateStatus(id, newStatus);
      loadComplaints();
    } catch (err) {
      alert('상태 변경에 실패했습니다');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { text: '접수', class: 'status-pending' },
      IN_PROGRESS: { text: '처리중', class: 'status-in-progress' },
      COMPLETED: { text: '완료', class: 'status-completed' },
      REJECTED: { text: '반려', class: 'status-rejected' },
    };
    const statusInfo = statusMap[status] || { text: status, class: '' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getCategoryText = (category) => {
    const categoryMap = {
      NOISE: '소음',
      PARKING: '주차',
      FACILITY: '시설',
      CLEANING: '청소',
      SECURITY: '보안',
      ELEVATOR: '엘리베이터',
      WATER: '수도',
      HEATING: '난방',
      OTHER: '기타',
    };
    return categoryMap[category] || category;
  };

  if (loading) return <div className="loading">로딩중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>민원 게시판</h1>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginRight: '10px', padding: '8px' }}
          >
            <option value="">전체</option>
            <option value="PENDING">접수</option>
            <option value="IN_PROGRESS">처리중</option>
            <option value="COMPLETED">완료</option>
            <option value="REJECTED">반려</option>
          </select>
        </div>
      </div>

      <div className="list-container">
        {complaints.length === 0 ? (
          <p className="empty-message">민원이 없습니다</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>분류</th>
                <th>제목</th>
                <th>민원인</th>
                <th>동/호</th>
                <th>상태</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr
                  key={complaint.id}
                  onClick={() => handleComplaintClick(complaint.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{complaint.id}</td>
                  <td>{getCategoryText(complaint.category)}</td>
                  <td>{complaint.title}</td>
                  <td>{complaint.requesterName}</td>
                  <td>{complaint.dong || '-'}/{complaint.ho || '-'}</td>
                  <td>{getStatusBadge(complaint.status)}</td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value, e)}
                      className="btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="PENDING">접수</option>
                      <option value="IN_PROGRESS">처리중</option>
                      <option value="COMPLETED">완료</option>
                      <option value="REJECTED">반려</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 0}>
            이전
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
            다음
          </button>
        </div>
      )}

      {/* 상세 모달 */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedComplaint.title}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <div className="modal-info-row">
                  <span className="modal-info-label">분류:</span>
                  <span className="modal-info-value">{getCategoryText(selectedComplaint.category)}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">민원인:</span>
                  <span className="modal-info-value">{selectedComplaint.requesterName}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">연락처:</span>
                  <span className="modal-info-value">{selectedComplaint.requesterPhone}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">주소:</span>
                  <span className="modal-info-value">
                    {selectedComplaint.dong && selectedComplaint.ho
                      ? `${selectedComplaint.dong}동 ${selectedComplaint.ho}호`
                      : '-'}
                  </span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">등록일:</span>
                  <span className="modal-info-value">{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-info-label">상태:</span>
                  <span className="modal-info-value">{getStatusBadge(selectedComplaint.status)}</span>
                </div>
                {selectedComplaint.assignedTo && (
                  <div className="modal-info-row">
                    <span className="modal-info-label">담당자:</span>
                    <span className="modal-info-value">{selectedComplaint.assignedTo.name}</span>
                  </div>
                )}
              </div>

              <div>
                <h3>민원 내용</h3>
                <div className="modal-content-text">
                  {selectedComplaint.content}
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>댓글 ({comments.length})</h3>
                <div style={{ marginTop: '15px' }}>
                  {comments.map((comment) => (
                    <div key={comment.id} style={{
                      background: '#f9f9f9',
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{comment.author?.name || 'Unknown'}</strong>
                        <span style={{ fontSize: '12px', color: '#999' }}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {comment.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '15px' }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    onClick={handleAddComment}
                    style={{
                      marginTop: '10px',
                      padding: '8px 20px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    댓글 작성
                  </button>
                </div>
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

export default ComplaintsPage;
