import React, { useState, useEffect } from 'react';
import { getActiveProjectsProgress, getAllStudentProgress } from '../api/teacherPanelApi';
import '../styles/ProgressView.css';

const ProgressView = () => {
  const [projects, setProjects] = useState([]);
  const [studentProgressData, setStudentProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActiveProjects = async () => {
      try {
        setLoading(true);
        const result = await getActiveProjectsProgress();
        if (result.success) {
          setProjects(result.projects || []);
        }
      } catch (error) {
        console.error('Error loading active projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveProjects();
  }, []);

  useEffect(() => {
    const loadAllProgress = async () => {
      try {
        const result = await getAllStudentProgress();
        if (result.success) {
          setStudentProgressData(result.progressData || []);
        }
      } catch (error) {
        console.error('Error loading all progress:', error);
      }
    };

    loadAllProgress();
  }, []);

  const hasLiveProgress = studentProgressData && studentProgressData.length > 0;

  const displayStudentProgress = () => {
    if (!hasLiveProgress) return null;

    return studentProgressData.map((progress, index) => (
      <div key={`student-progress-${index}`} className="p-card" style={{ border: '2px solid #4f46e5' }}>
        <div className="p-main">
          <div className="p-chip p-chipPrimary">
            Student Progress
          </div>
          <h3 className="p-cardTitle">
            {progress.projectName?.trim() || 'Student Project'}
          </h3>
          <div className="p-row">
            <div className="p-team">
              <p className="p-leader">
                Leader: <span>{progress.leaderName?.trim() || 'Not set'}</span>
              </p>
              {progress.members && progress.members.length > 0 && (
                <p className="p-leader p-members">
                  Members: <span>{progress.members.join(', ')}</span>
                </p>
              )}
            </div>
            <div className="p-barBox">
              <div className="p-headRow">
                <span className="p-label">Completion</span>
                <span className="p-value">{progress.progress ?? 0}%</span>
              </div>
              <div className="p-barBg">
                <div
                  className={`p-barFill ${
                    (progress.progress ?? 0) > 80
                      ? 'p-barEmerald'
                      : (progress.progress ?? 0) > 50
                        ? 'p-barPrimary'
                        : 'p-barAmber'
                  }`}
                  style={{ width: `${progress.progress ?? 0}%` }}
                ></div>
              </div>
              <div className="p-meta">
                <span>
                  {progress.tasks?.filter((t) => t.status === 'Completed').length || 0}{' '}
                  Tasks Completed
                </span>
                <span>{progress.tasks?.length || 0} Total Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-page">
      <div className="p-head">
        <div className="p-headTxt">
          <h2 className="p-title">Student Progress</h2>
          <p className="p-sub">Track project progress of all student groups.</p>
        </div>
      </div>

      <div className="p-list">
        {loading ? (
          <div className="p-empty">
            <p className="p-emptyText">Loading progress data...</p>
          </div>
        ) : !hasLiveProgress ? (
          <div className="p-empty">
            <p className="p-emptyText">No live student progress found yet. Students need to set up their project and track progress in the student panel.</p>
          </div>
        ) : (
          displayStudentProgress()
        )}
      </div>
    </div>
  );
};

export default ProgressView;
