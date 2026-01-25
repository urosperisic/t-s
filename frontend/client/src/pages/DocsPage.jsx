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

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await snippetsAPI.getBooks();
      setBooks(data);
      if (data.length > 0) {
        fetchBook(data[0].id);
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
      if (data.chapters && data.chapters.length > 0) {
        fetchChapter(data.chapters[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchChapter = async (chapterId) => {
    try {
      const data = await snippetsAPI.getChapter(chapterId);
      setSelectedChapter(data);
      if (data.sections && data.sections.length > 0) {
        fetchSection(data.sections[0].id);
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

  const customCodeStyle = {
    color: 'var(--c-text)',
  };

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        Loading documentation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="message message-error" role="alert">
        {error}
      </div>
    );
  }

  if (books.length === 0) {
    return <div className="empty-state">No documentation available yet.</div>;
  }

  return (
  <>
    {books.length > 1 && (
      <div style={{ marginBottom: '2rem', maxWidth: '25rem' }}>
        <label htmlFor="book-select" className="visually-hidden">
          Select Book
        </label>
        <select
          id="book-select"
          value={selectedBook?.id || ''}
          onChange={(e) => fetchBook(e.target.value)}
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
            <h1 className="section-title">{selectedSection.title}</h1>

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

                  <SyntaxHighlighter
                    language={snippet.language}
                    style={{}}
                    customStyle={customStyle}
                    codeTagProps={{ style: customCodeStyle }}
                    className="snippet-code"
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
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
  </>
);
}

export default DocsPage;