# snippets/views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin

from .models import Book, Chapter, Section, Snippet
from .permissions import IsAdminOrReadOnly
from .serializers import (
    BookDetailSerializer,
    BookListSerializer,
    BookSerializer,
    ChapterDetailSerializer,
    ChapterListSerializer,
    ChapterSerializer,
    SectionDetailSerializer,
    SectionListSerializer,
    SectionSerializer,
    SnippetSerializer,
)


# ==================== BOOK VIEWS ====================
class BookListView(generics.ListAPIView):
    """List all books (users see only published, admins see all)"""

    serializer_class = BookListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "admin":
            return Book.objects.all()
        return Book.objects.filter(is_published=True)


class BookDetailView(generics.RetrieveAPIView):
    """Get single book with chapter IDs (lazy loading)"""

    serializer_class = BookDetailSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "id"

    def get_queryset(self):
        # Only prefetch chapters, not all nested data
        if self.request.user.role == "admin":
            return Book.objects.prefetch_related("chapters")
        return Book.objects.filter(is_published=True).prefetch_related("chapters")


class BookCreateView(generics.CreateAPIView):
    """Create a new book (admin only)"""

    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class BookUpdateView(generics.UpdateAPIView):
    """Update a book (admin only)"""

    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "id"


class BookDeleteView(generics.DestroyAPIView):
    """Delete a book (admin only)"""

    queryset = Book.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "id"


# ==================== CHAPTER VIEWS ====================
class ChapterListView(generics.ListAPIView):
    """List chapters for a specific book"""

    serializer_class = ChapterListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        book_id = self.kwargs.get("book_id")
        queryset = Chapter.objects.filter(book_id=book_id)

        if self.request.user.role == "user":
            queryset = queryset.filter(is_published=True)

        return queryset


class ChapterDetailView(generics.RetrieveAPIView):
    """Get single chapter with section IDs (lazy loading)"""

    serializer_class = ChapterDetailSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "id"

    def get_queryset(self):
        # Only prefetch sections, not snippets
        if self.request.user.role == "admin":
            return Chapter.objects.prefetch_related("sections")
        return Chapter.objects.filter(is_published=True).prefetch_related("sections")


class ChapterCreateView(generics.CreateAPIView):
    """Create a new chapter (admin only)"""

    serializer_class = ChapterSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class ChapterUpdateView(generics.UpdateAPIView):
    """Update a chapter (admin only)"""

    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "id"


class ChapterDeleteView(generics.DestroyAPIView):
    """Delete a chapter (admin only)"""

    queryset = Chapter.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "id"


# ==================== SECTION VIEWS ====================
class SectionListView(generics.ListAPIView):
    """List sections for a specific chapter"""

    serializer_class = SectionListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        chapter_id = self.kwargs.get("chapter_id")
        queryset = Section.objects.filter(chapter_id=chapter_id)

        if self.request.user.role == "user":
            queryset = queryset.filter(is_published=True)

        return queryset


class SectionDetailView(generics.RetrieveAPIView):
    """Get single section with full snippets (loaded on demand)"""

    serializer_class = SectionDetailSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "id"

    def get_queryset(self):
        # NOW we load snippets, only when section is actually viewed
        if self.request.user.role == "admin":
            return Section.objects.prefetch_related("snippets")
        return Section.objects.filter(is_published=True).prefetch_related("snippets")


class SectionCreateView(generics.CreateAPIView):
    """Create a new section (admin only)"""

    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class SectionUpdateView(generics.UpdateAPIView):
    """Update a section (admin only)"""

    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "id"


class SectionDeleteView(generics.DestroyAPIView):
    """Delete a section (admin only)"""

    queryset = Section.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "id"


# ==================== SNIPPET VIEWS ====================
class SnippetListView(generics.ListAPIView):
    """List snippets for a specific section"""

    serializer_class = SnippetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        section_id = self.kwargs.get("section_id")
        queryset = Snippet.objects.filter(section_id=section_id)

        if self.request.user.role == "user":
            queryset = queryset.filter(is_published=True)

        return queryset


class SnippetDetailView(generics.RetrieveAPIView):
    """Get single snippet"""

    serializer_class = SnippetSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "id"

    def get_queryset(self):
        if self.request.user.role == "admin":
            return Snippet.objects.all()
        return Snippet.objects.filter(is_published=True)


class SnippetCreateView(generics.CreateAPIView):
    """Create a new snippet (admin only)"""

    serializer_class = SnippetSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SnippetUpdateView(generics.UpdateAPIView):
    """Update a snippet (admin only)"""

    queryset = Snippet.objects.all()
    serializer_class = SnippetSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "id"


class SnippetDeleteView(generics.DestroyAPIView):
    """Delete a snippet (admin only)"""

    queryset = Snippet.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "id"