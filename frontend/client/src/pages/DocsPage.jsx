// frontend/client/src/pages/DocsPage.jsx

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { snippetsAPI } from '../utils/api';

function DocsPage() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await snippetsAPI.getBooks();
      setBooks(data);
      if (data.length > 0) {
        await fetchBook(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBook = async (bookId) => {
    try {
      const data = await snippetsAPI.getBook(bookId);
      setSelectedBook(data);
      setSelectedChapter(null);
      setSelectedSection(null);
      
      // Auto-select first chapter if available
      if (data.chapters && data.chapters.length > 0) {
        await fetchChapter(data.chapters[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchChapter = async (chapterId) => {
    try {
      const data = await snippetsAPI.getChapter(chapterId);
      setSelectedChapter(data);
      setSelectedSection(null);
      
      // Auto-select first section if available
      if (data.sections && data.sections.length > 0) {
        await fetchSection(data.sections[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSection = async (sectionId) => {
    try {
      const data = await snippetsAPI.getSection(sectionId);
      setSelectedSection(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const customStyle = {
    background: 'var(--c-back-light)',
    padding: '1.6rem',
    margin: 0,
    fontSize: '1.3rem',
    lineHeight: '1.6',
  };

  const customTokenStyles = {
    'keyword': { color: '#C678DD' },
    'string': { color: '#98C379' },
    'comment': { color: 'var(--c-text)', opacity: 0.7 },
  };

  const customCodeStyle = {
    color: 'var(--c-text)',
  };

  const copyToClipboard = async (code, snippetId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(snippetId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading" role="status" aria-live="polite">
          Loading documentation...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="message message-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">No documentation available yet.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Docs</h1>
      </header>

      {books.length > 1 && (
        <div style={{ marginBottom: '2rem', maxWidth: '25rem' }}>
          <label htmlFor="book-select" className="visually-hidden">
            Select Book
          </label>
          <select
            id="book-select"
            value={selectedBook?.id || ''}
            onChange={(e) => fetchBook(Number(e.target.value))}
            className="form-select"
          >
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="docs-container">
        <aside className="docs-sidebar" aria-label="Documentation navigation">
          <nav>
            <ul className="docs-nav">
              {selectedBook?.chapters?.map((chapter) => (
                <li key={chapter.id} className="docs-nav-item">
                  <button
                    onClick={() => fetchChapter(chapter.id)}
                    className={`docs-nav-link ${
                      selectedChapter?.id === chapter.id ? 'active' : ''
                    }`}
                    type="button"
                  >
                    {chapter.order}. {chapter.title}
                  </button>
                  {selectedChapter?.id === chapter.id &&
                    selectedChapter.sections && (
                      <ul className="docs-nav" style={{ marginLeft: '1.6rem' }}>
                        {selectedChapter.sections.map((section) => (
                          <li key={section.id} className="docs-nav-item">
                            <button
                              onClick={() => fetchSection(section.id)}
                              className={`docs-nav-link ${
                                selectedSection?.id === section.id ? 'active' : ''
                              }`}
                              type="button"
                            >
                              {section.order}. {section.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="docs-content">
          {selectedSection ? (
            <>
              <p className="section-title">{selectedSection.title}</p>

              {selectedSection.snippets && selectedSection.snippets.length > 0 ? (
                selectedSection.snippets.map((snippet) => (
                  <article key={snippet.id} className="snippet">
                    <header className="snippet-header">
                      <p className="snippet-title">{snippet.title}</p>
                      <p className="snippet-language">{snippet.language}</p>
                    </header>

                    {snippet.explanation && (
                      <div className="snippet-explanation">
                        {snippet.explanation}
                      </div>
                    )}

                    <div className="snippet-code-wrapper">
                      <button
                        onClick={() => copyToClipboard(snippet.code, snippet.id)}
                        className="copy-button"
                        aria-label="Copy code"
                        type="button"
                      >
                        {copiedId === snippet.id ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        )}
                      </button>

                      <SyntaxHighlighter
                        language={snippet.language}
                        style={customTokenStyles}
                        customStyle={customStyle}
                        codeTagProps={{ style: customCodeStyle }}
                        className="snippet-code"
                      >
                        {snippet.code}
                      </SyntaxHighlighter>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">No code snippets yet.</div>
              )}
            </>
          ) : (
            <div className="empty-state">Select a section to view content.</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DocsPage;