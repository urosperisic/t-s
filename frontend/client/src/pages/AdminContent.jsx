// frontend/client/src/pages/AdminContent.jsx

import { useState, useEffect } from 'react';
import { snippetsAPI } from '../utils/api';

function AdminContent() {
  const [activeTab, setActiveTab] = useState('book');
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [sections, setSections] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    is_published: false,
  });

  const [chapterForm, setChapterForm] = useState({
    book: '',
    title: '',
    order: '',
    is_published: false,
  });

  const [sectionForm, setSectionForm] = useState({
    chapter: '',
    title: '',
    order: '',
    is_published: false,
  });

  const [snippetForm, setSnippetForm] = useState({
    section: '',
    title: '',
    code: '',
    language: 'python',
    explanation: '',
    order: '',
    is_published: false,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await snippetsAPI.getBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChapters = async (bookId) => {
    try {
      const data = await snippetsAPI.getChapters(bookId);
      setChapters(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSections = async (chapterId) => {
    try {
      const data = await snippetsAPI.getSections(chapterId);
      setSections(data);
    } catch (err) {
      console.error(err);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await snippetsAPI.createBook(bookForm);
      showMessage('success', 'Book created successfully');
      setBookForm({ title: '', description: '', is_published: false });
      fetchBooks();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    try {
      await snippetsAPI.createChapter(chapterForm);
      showMessage('success', 'Chapter created successfully');
      setChapterForm({ book: '', title: '', order: '', is_published: false });
      if (chapterForm.book) fetchChapters(chapterForm.book);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      await snippetsAPI.createSection(sectionForm);
      showMessage('success', 'Section created successfully');
      setSectionForm({ chapter: '', title: '', order: '', is_published: false });
      if (sectionForm.chapter) fetchSections(sectionForm.chapter);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleSnippetSubmit = async (e) => {
    e.preventDefault();
    try {
      await snippetsAPI.createSnippet(snippetForm);
      showMessage('success', 'Snippet created successfully');
      setSnippetForm({
        section: '',
        title: '',
        code: '',
        language: 'python',
        explanation: '',
        order: '',
        is_published: false,
      });
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">Add Content</h1>
      </header>

      {message.text && (
        <div
          className={`message message-${message.type}`}
          role="alert"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      <div className="tabs">
        <ul className="tabs-list" role="tablist">
          <li role="presentation">
            <button
              className={`tab-button ${activeTab === 'book' ? 'active' : ''}`}
              onClick={() => setActiveTab('book')}
              role="tab"
              aria-selected={activeTab === 'book'}
              aria-controls="book-panel"
              id="book-tab"
              type="button"
            >
              Book
            </button>
          </li>
          <li role="presentation">
            <button
              className={`tab-button ${activeTab === 'chapter' ? 'active' : ''}`}
              onClick={() => setActiveTab('chapter')}
              role="tab"
              aria-selected={activeTab === 'chapter'}
              aria-controls="chapter-panel"
              id="chapter-tab"
              type="button"
            >
              Chapter
            </button>
          </li>
          <li role="presentation">
            <button
              className={`tab-button ${activeTab === 'section' ? 'active' : ''}`}
              onClick={() => setActiveTab('section')}
              role="tab"
              aria-selected={activeTab === 'section'}
              aria-controls="section-panel"
              id="section-tab"
              type="button"
            >
              Section
            </button>
          </li>
          <li role="presentation">
            <button
              className={`tab-button ${activeTab === 'snippet' ? 'active' : ''}`}
              onClick={() => setActiveTab('snippet')}
              role="tab"
              aria-selected={activeTab === 'snippet'}
              aria-controls="snippet-panel"
              id="snippet-tab"
              type="button"
            >
              Snippet
            </button>
          </li>
        </ul>
      </div>

      {/* Book Form */}
      {activeTab === 'book' && (
        <div
          className="admin-form"
          role="tabpanel"
          id="book-panel"
          aria-labelledby="book-tab"
        >
          <form onSubmit={handleBookSubmit} className="form">
            <div className="form-group">
              <label htmlFor="book-title" className="visually-hidden">
                Book Title
              </label>
              <input
                type="text"
                id="book-title"
                value={bookForm.title}
                onChange={(e) =>
                  setBookForm({ ...bookForm, title: e.target.value })
                }
                placeholder="Book Title"
                className="form-input"
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-description" className="visually-hidden">
                Description
              </label>
              <textarea
                id="book-description"
                value={bookForm.description}
                onChange={(e) =>
                  setBookForm({ ...bookForm, description: e.target.value })
                }
                placeholder="Description"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-published">
                <input
                  type="checkbox"
                  id="book-published"
                  checked={bookForm.is_published}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, is_published: e.target.checked })
                  }
                />
                {' '}Published
              </label>
            </div>

            <button type="submit" className="btn">
              Create Book
            </button>
          </form>
        </div>
      )}

      {/* Chapter Form */}
      {activeTab === 'chapter' && (
        <div
          className="admin-form"
          role="tabpanel"
          id="chapter-panel"
          aria-labelledby="chapter-tab"
        >
          <form onSubmit={handleChapterSubmit} className="form">
            <div className="form-group">
              <label htmlFor="chapter-book" className="visually-hidden">
                Select Book
              </label>
              <select
                id="chapter-book"
                value={chapterForm.book}
                onChange={(e) => {
                  setChapterForm({ ...chapterForm, book: e.target.value });
                  fetchChapters(e.target.value);
                }}
                className="form-select"
                required
                aria-required="true"
              >
                <option value="">Select Book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="chapter-title" className="visually-hidden">
                  Chapter Title
                </label>
                <input
                  type="text"
                  id="chapter-title"
                  value={chapterForm.title}
                  onChange={(e) =>
                    setChapterForm({ ...chapterForm, title: e.target.value })
                  }
                  placeholder="Chapter Title"
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="chapter-order" className="visually-hidden">
                  Order (e.g., 1.0, 1.5, 2.0)
                </label>
                <input
                  type="number"
                  id="chapter-order"
                  value={chapterForm.order}
                  onChange={(e) =>
                    setChapterForm({ ...chapterForm, order: e.target.value })
                  }
                  placeholder="Order (e.g., 1.0)"
                  step="0.1"
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="chapter-published">
                <input
                  type="checkbox"
                  id="chapter-published"
                  checked={chapterForm.is_published}
                  onChange={(e) =>
                    setChapterForm({
                      ...chapterForm,
                      is_published: e.target.checked,
                    })
                  }
                />
                {' '}Published
              </label>
            </div>

            <button type="submit" className="btn">
              Create Chapter
            </button>
          </form>
        </div>
      )}

      {/* Section Form */}
      {activeTab === 'section' && (
        <div
          className="admin-form"
          role="tabpanel"
          id="section-panel"
          aria-labelledby="section-tab"
        >
          <form onSubmit={handleSectionSubmit} className="form">
            <div className="form-group">
              <label htmlFor="section-chapter" className="visually-hidden">
                Select Chapter
              </label>
              <select
                id="section-chapter"
                value={sectionForm.chapter}
                onChange={(e) => {
                  setSectionForm({ ...sectionForm, chapter: e.target.value });
                  fetchSections(e.target.value);
                }}
                className="form-select"
                required
                aria-required="true"
              >
                <option value="">Select Chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.order}. {chapter.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="section-title" className="visually-hidden">
                  Section Title
                </label>
                <input
                  type="text"
                  id="section-title"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, title: e.target.value })
                  }
                  placeholder="Section Title"
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="section-order" className="visually-hidden">
                  Order (e.g., 1.0, 1.5, 2.0)
                </label>
                <input
                  type="number"
                  id="section-order"
                  value={sectionForm.order}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, order: e.target.value })
                  }
                  placeholder="Order (e.g., 1.0)"
                  step="0.1"
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="section-published">
                <input
                  type="checkbox"
                  id="section-published"
                  checked={sectionForm.is_published}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      is_published: e.target.checked,
                    })
                  }
                />
                {' '}Published
              </label>
            </div>

            <button type="submit" className="btn">
              Create Section
            </button>
          </form>
        </div>
      )}

      {/* Snippet Form */}
      {activeTab === 'snippet' && (
        <div
          className="admin-form"
          role="tabpanel"
          id="snippet-panel"
          aria-labelledby="snippet-tab"
        >
          <form onSubmit={handleSnippetSubmit} className="form">
            <div className="form-group">
              <label htmlFor="snippet-section" className="visually-hidden">
                Select Section
              </label>
              <select
                id="snippet-section"
                value={snippetForm.section}
                onChange={(e) =>
                  setSnippetForm({ ...snippetForm, section: e.target.value })
                }
                className="form-select"
                required
                aria-required="true"
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.order}. {section.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="snippet-title" className="visually-hidden">
                  Snippet Title
                </label>
                <input
                  type="text"
                  id="snippet-title"
                  value={snippetForm.title}
                  onChange={(e) =>
                    setSnippetForm({ ...snippetForm, title: e.target.value })
                  }
                  placeholder="Snippet Title"
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="snippet-order" className="visually-hidden">
                  Order (e.g., 1.0, 1.5, 2.0)
                </label>
                <input
                  type="number"
                  id="snippet-order"
                  value={snippetForm.order}
                  onChange={(e) =>
                    setSnippetForm({ ...snippetForm, order: e.target.value })
                  }
                  placeholder="Order (e.g., 1.0)"
                  step="0.1"
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="snippet-language" className="visually-hidden">
                Programming Language
              </label>
              <select
                id="snippet-language"
                value={snippetForm.language}
                onChange={(e) =>
                  setSnippetForm({ ...snippetForm, language: e.target.value })
                }
                className="form-select"
                required
                aria-required="true"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="snippet-code" className="visually-hidden">
                Code
              </label>
              <textarea
                id="snippet-code"
                value={snippetForm.code}
                onChange={(e) =>
                  setSnippetForm({ ...snippetForm, code: e.target.value })
                }
                placeholder="Code"
                className="form-textarea"
                required
                aria-required="true"
                style={{ minHeight: '20rem' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="snippet-explanation" className="visually-hidden">
                Explanation
              </label>
              <textarea
                id="snippet-explanation"
                value={snippetForm.explanation}
                onChange={(e) =>
                  setSnippetForm({
                    ...snippetForm,
                    explanation: e.target.value,
                  })
                }
                placeholder="Explanation"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="snippet-published">
                <input
                  type="checkbox"
                  id="snippet-published"
                  checked={snippetForm.is_published}
                  onChange={(e) =>
                    setSnippetForm({
                      ...snippetForm,
                      is_published: e.target.checked,
                    })
                  }
                />
                {' '}Published
              </label>
            </div>

            <button type="submit" className="btn">
              Create Snippet
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminContent;