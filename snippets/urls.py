# snippets/urls.py

from django.urls import path

from .views import (
    BookCreateView,
    BookDeleteView,
    BookDetailView,
    BookListView,
    BookUpdateView,
    ChapterCreateView,
    ChapterDeleteView,
    ChapterDetailView,
    ChapterListView,
    ChapterUpdateView,
    SectionCreateView,
    SectionDeleteView,
    SectionDetailView,
    SectionListView,
    SectionUpdateView,
    SnippetCreateView,
    SnippetDeleteView,
    SnippetDetailView,
    SnippetListView,
    SnippetUpdateView,
)

app_name = "snippets"

urlpatterns = [
    # Book endpoints
    path("books/", BookListView.as_view(), name="book_list"),
    path("books/create/", BookCreateView.as_view(), name="book_create"),
    path("books/<int:id>/", BookDetailView.as_view(), name="book_detail"),
    path("books/<int:id>/update/", BookUpdateView.as_view(), name="book_update"),
    path("books/<int:id>/delete/", BookDeleteView.as_view(), name="book_delete"),
    # Chapter endpoints
    path(
        "books/<int:book_id>/chapters/",
        ChapterListView.as_view(),
        name="chapter_list",
    ),
    path("chapters/create/", ChapterCreateView.as_view(), name="chapter_create"),
    path("chapters/<int:id>/", ChapterDetailView.as_view(), name="chapter_detail"),
    path(
        "chapters/<int:id>/update/", ChapterUpdateView.as_view(), name="chapter_update"
    ),
    path(
        "chapters/<int:id>/delete/", ChapterDeleteView.as_view(), name="chapter_delete"
    ),
    # Section endpoints
    path(
        "chapters/<int:chapter_id>/sections/",
        SectionListView.as_view(),
        name="section_list",
    ),
    path("sections/create/", SectionCreateView.as_view(), name="section_create"),
    path("sections/<int:id>/", SectionDetailView.as_view(), name="section_detail"),
    path(
        "sections/<int:id>/update/", SectionUpdateView.as_view(), name="section_update"
    ),
    path(
        "sections/<int:id>/delete/", SectionDeleteView.as_view(), name="section_delete"
    ),
    # Snippet endpoints
    path(
        "sections/<int:section_id>/snippets/",
        SnippetListView.as_view(),
        name="snippet_list",
    ),
    path("snippets/create/", SnippetCreateView.as_view(), name="snippet_create"),
    path("snippets/<int:id>/", SnippetDetailView.as_view(), name="snippet_detail"),
    path(
        "snippets/<int:id>/update/", SnippetUpdateView.as_view(), name="snippet_update"
    ),
    path(
        "snippets/<int:id>/delete/", SnippetDeleteView.as_view(), name="snippet_delete"
    ),
]
