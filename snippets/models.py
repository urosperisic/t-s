# snippets/models.py

from django.conf import settings
from django.db import models


class Book(models.Model):
    """Main documentation book (e.g., 'The Rust Programming Language')"""

    title = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="books",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]
        verbose_name = "Book"
        verbose_name_plural = "Books"

    def __str__(self):
        return self.title


class Chapter(models.Model):
    """Chapter in a book (e.g., 'Chapter 3: Common Programming Concepts')"""

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="chapters")
    title = models.CharField(max_length=255)
    order = models.FloatField(
        help_text="Order number (e.g., 1.0, 1.5, 2.0 for insertion flexibility)"
    )
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["book", "order"]
        unique_together = ["book", "order"]
        verbose_name = "Chapter"
        verbose_name_plural = "Chapters"

    def __str__(self):
        return f"{self.book.title} - Chapter {self.order}: {self.title}"


class Section(models.Model):
    """Section in a chapter (e.g., 'Section 3.1: Variables and Mutability')"""

    chapter = models.ForeignKey(
        Chapter, on_delete=models.CASCADE, related_name="sections"
    )
    title = models.CharField(max_length=255)
    order = models.FloatField(
        help_text="Order number (e.g., 1.0, 1.5, 2.0 for insertion flexibility)"
    )
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["chapter", "order"]
        unique_together = ["chapter", "order"]
        verbose_name = "Section"
        verbose_name_plural = "Sections"

    def __str__(self):
        return f"{self.chapter} - Section {self.order}: {self.title}"


class Snippet(models.Model):
    """Code snippet with explanation"""

    LANGUAGE_CHOICES = [
        ("python", "Python"),
        ("javascript", "JavaScript"),
        ("typescript", "TypeScript"),
        ("rust", "Rust"),
        ("go", "Go"),
        ("java", "Java"),
        ("cpp", "C++"),
        ("html", "HTML"),
        ("css", "CSS"),
        ("sql", "SQL"),
        ("bash", "Bash"),
        ("other", "Other"),
    ]

    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="snippets"
    )
    title = models.CharField(max_length=255)
    code = models.TextField(help_text="The code snippet")
    language = models.CharField(
        max_length=20, choices=LANGUAGE_CHOICES, default="python"
    )
    explanation = models.TextField(
        blank=True, help_text="Explanation of what the code does"
    )
    order = models.FloatField(
        help_text="Order number (e.g., 1.0, 1.5, 2.0 for insertion flexibility)"
    )
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="snippets",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["section", "order"]
        unique_together = ["section", "order"]
        verbose_name = "Snippet"
        verbose_name_plural = "Snippets"

    def __str__(self):
        return f"{self.section} - Snippet {self.order}: {self.title}"
