# snippets/admin.py

from django.contrib import admin

from .models import Book, Chapter, Section, Snippet


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("title", "is_published", "created_by", "created_at")
    list_filter = ("is_published", "created_at")
    search_fields = ("title", "description")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ("title", "book", "order", "is_published", "created_at")
    list_filter = ("book", "is_published", "created_at")
    search_fields = ("title",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("book", "order")


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("title", "chapter", "order", "is_published", "created_at")
    list_filter = ("chapter__book", "is_published", "created_at")
    search_fields = ("title",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("chapter", "order")


@admin.register(Snippet)
class SnippetAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "section",
        "language",
        "order",
        "is_published",
        "created_by",
        "created_at",
    )
    list_filter = ("language", "is_published", "created_at", "section__chapter__book")
    search_fields = ("title", "code", "explanation")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("section", "order")
