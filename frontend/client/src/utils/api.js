// frontend/client/src/utils/api.js

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Fetch wrapper with credentials and error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle no content responses
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// ==================== AUTH API ====================
export const authAPI = {
  register: (userData) =>
    fetchAPI('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    fetchAPI('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    fetchAPI('/auth/logout/', {
      method: 'POST',
    }),

  getCurrentUser: () => fetchAPI('/auth/user/'),

  refreshToken: () =>
    fetchAPI('/auth/refresh/', {
      method: 'POST',
    }),

  listUsers: () => fetchAPI('/auth/users/'),

  deleteUser: (userId) =>
    fetchAPI(`/auth/users/${userId}/`, {
      method: 'DELETE',
    }),
};

// ==================== SNIPPETS API ====================
export const snippetsAPI = {
  // Books
  getBooks: () => fetchAPI('/snippets/books/'),
  getBook: (id) => fetchAPI(`/snippets/books/${id}/`),
  createBook: (data) =>
    fetchAPI('/snippets/books/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBook: (id, data) =>
    fetchAPI(`/snippets/books/${id}/update/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBook: (id) =>
    fetchAPI(`/snippets/books/${id}/delete/`, {
      method: 'DELETE',
    }),

  // Chapters
  getChapters: (bookId) => fetchAPI(`/snippets/books/${bookId}/chapters/`),
  getChapter: (id) => fetchAPI(`/snippets/chapters/${id}/`),
  createChapter: (data) =>
    fetchAPI('/snippets/chapters/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateChapter: (id, data) =>
    fetchAPI(`/snippets/chapters/${id}/update/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteChapter: (id) =>
    fetchAPI(`/snippets/chapters/${id}/delete/`, {
      method: 'DELETE',
    }),

  // Sections
  getSections: (chapterId) =>
    fetchAPI(`/snippets/chapters/${chapterId}/sections/`),
  getSection: (id) => fetchAPI(`/snippets/sections/${id}/`),
  createSection: (data) =>
    fetchAPI('/snippets/sections/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSection: (id, data) =>
    fetchAPI(`/snippets/sections/${id}/update/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSection: (id) =>
    fetchAPI(`/snippets/sections/${id}/delete/`, {
      method: 'DELETE',
    }),

  // Snippets
  getSnippets: (sectionId) =>
    fetchAPI(`/snippets/sections/${sectionId}/snippets/`),
  getSnippet: (id) => fetchAPI(`/snippets/snippets/${id}/`),
  createSnippet: (data) =>
    fetchAPI('/snippets/snippets/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSnippet: (id, data) =>
    fetchAPI(`/snippets/snippets/${id}/update/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSnippet: (id) =>
    fetchAPI(`/snippets/snippets/${id}/delete/`, {
      method: 'DELETE',
    }),
};