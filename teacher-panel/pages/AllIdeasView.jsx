import React, { useState, useEffect } from 'react';
import { getAllIdeasFiltered } from '../api/teacherPanelApi';
import '../styles/AllIdeasView.css';

const AllIdeasView = () => {
  const [ideas, setIdeas] = useState([]);
  const [currentTab, setCurrentTab] = useState('Accepted');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load ideas from backend based on current tab
    const loadIdeas = async () => {
      try {
        setLoading(true);
        let filters = {};
        
        if (currentTab === 'Accepted') {
          filters.status = 'Accepted';
        } else if (currentTab === 'Rejected') {
          filters.status = 'Rejected';
        } else if (currentTab === 'Morning') {
          filters.session = 'Morning';
        } else if (currentTab === 'Evening') {
          filters.session = 'Evening';
        }
        
        const result = await getAllIdeasFiltered(filters);
        if (result.success) {
          setIdeas(result.ideas || []);
        }
      } catch (error) {
        console.error('Error loading ideas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
    
    // Check for new submissions every 2 seconds
    const interval = setInterval(loadIdeas, 2000);
    
    return () => clearInterval(interval);
  }, [currentTab]);

  // Since we fetch filtered data from backend, filteredIdeas is just the ideas we received
  const filteredIdeas = ideas;

  // For badge counts, we need to fetch all ideas without filters
  const [allIdeas, setAllIdeas] = useState([]);

  useEffect(() => {
    const loadAllIdeasForCounts = async () => {
      try {
        const result = await getAllIdeasFiltered({});
        if (result.success) {
          setAllIdeas(result.ideas || []);
        }
      } catch (error) {
        console.error('Error loading all ideas for counts:', error);
      }
    };
    loadAllIdeasForCounts();
  }, []);

  const acceptedCount = allIdeas.filter(i => i.status === 'Accepted').length;
  const rejectedCount = allIdeas.filter(i => i.status === 'Rejected').length;
  const morningCount = allIdeas.filter(i => i.session.includes('Morning') && (i.status === 'Accepted' || i.status === 'Rejected')).length;
  const eveningCount = allIdeas.filter(i => i.session.includes('Evening') && (i.status === 'Accepted' || i.status === 'Rejected')).length;

  return (
    <div className="i-page">
      <div className="i-head">
        <h2 className="i-title">All Ideas</h2>
        <p className="i-subtitle">Manage approved and rejected FYP across all sessions.</p>
      </div>

      <div className="i-tabsWrap">
        <nav aria-label="Tabs" className="i-tabs">
          <button
            onClick={() => setCurrentTab('Accepted')}
            className={`i-tab ${currentTab === 'Accepted' ? 'i-tabActive' : ''}`}
          >
            <span className="material-symbols-outlined i-tabIcon">check_circle</span>
            Accepted Ideas
            <span className="i-tabBadge i-tabBlue">{acceptedCount}</span>
          </button>

          <button
            onClick={() => setCurrentTab('Rejected')}
            className={`i-tab ${currentTab === 'Rejected' ? 'i-tabActive' : ''}`}
          >
            <span className="material-symbols-outlined i-tabIcon">cancel</span>
            Rejected Ideas
            <span className="i-tabBadge i-tabGray">{rejectedCount}</span>
          </button>

          <button
            onClick={() => setCurrentTab('Morning')}
            className={`i-tab ${currentTab === 'Morning' ? 'i-tabActive' : ''}`}
          >
            <span className="material-symbols-outlined i-tabIcon">wb_sunny</span>
            Morning Session
            <span className="i-tabBadge i-tabOrange">{morningCount}</span>
          </button>

          <button
            onClick={() => setCurrentTab('Evening')}
            className={`i-tab ${currentTab === 'Evening' ? 'i-tabActive' : ''}`}
          >
            <span className="material-symbols-outlined i-tabIcon">nights_stay</span>
            Evening Session
            <span className="i-tabBadge i-tabPurple">{eveningCount}</span>
          </button>
        </nav>
      </div>

      <div className="i-card">
        <div className="i-cardHead">
          <div className="i-cardLeft">
            <span
              className={`material-symbols-outlined i-icon ${
                currentTab === 'Accepted'
                  ? 'i-iconAccept'
                  : currentTab === 'Rejected'
                    ? 'i-iconReject'
                    : 'i-iconDefault'
              }`}
            >
              {currentTab === 'Accepted' ? 'check_circle' : currentTab === 'Rejected' ? 'cancel' : 'list_alt'}
            </span>
            <h3 className="i-cardTitle">{currentTab} Ideas</h3>
          </div>
        </div>

        <div className="i-tableWrap">
          <table className="i-table">
            <thead className="i-tableHead">
              <tr>
                <th className="i-th">Idea Name</th>
                <th className="i-th i-thDesc">Description</th>
                <th className="i-th">Leader Name</th>
                <th className="i-th">Session</th>
                <th className="i-th i-thRight">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.map((idea, index) => {
                const ideaKey = idea._id || idea.id || `${idea.title}-${idea.session}-${index}`;

                return (
                  <tr key={ideaKey} className="i-row">
                    <td className="i-cell i-titleCell">{idea.title}</td>
                    <td className="i-cell i-descrCell">{idea.shortDescription}</td>
                    <td className="i-cell">{idea.leader.name}</td>
                    <td className="i-cell i-sessionCell">{idea.session}</td>
                    <td className="i-cell i-rightCell">
                      <span
                        className={`i-pill ${
                          idea.status === 'Accepted'
                            ? 'i-pillAccept'
                            : idea.status === 'Rejected'
                              ? 'i-pillReject'
                              : 'i-pillPending'
                        }`}
                      >
                        {idea.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredIdeas.length === 0 && (
                <tr>
                  <td colSpan={5} className="i-empty">No items found in this view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="i-footer">
          <p className="i-footerText">Showing {filteredIdeas.length} results</p>
        </div>
      </div>
    </div>
  );
};

export default AllIdeasView;
