# snippets/serializers.py

from rest_framework import serializers

from .models import Book, Chapter, Section, Snippet


class SnippetSerializer(serializers.ModelSerializer):
    """Serializer for code snippets"""

    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = Snippet
        fields = (
            "id",
            "section",
            "title",
            "code",
            "language",
            "explanation",
            "order",
            "is_published",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "created_at", "updated_at")

    def validate_order(self, value):
        """Ensure order is positive"""
        if value <= 0:
            raise serializers.ValidationError("Order must be greater than 0")
        return value


# ==================== LIGHTWEIGHT SERIALIZERS (IDs only) ====================
class ChapterMinimalSerializer(serializers.ModelSerializer):
    """Minimal chapter data - just IDs and titles for sidebar"""

    class Meta:
        model = Chapter
        fields = ("id", "title", "order", "is_published")


class SectionMinimalSerializer(serializers.ModelSerializer):
    """Minimal section data - just IDs and titles for sidebar"""

    class Meta:
        model = Section
        fields = ("id", "title", "order", "is_published")


# ==================== DETAIL SERIALIZERS (used in detail views) ====================
class SectionDetailSerializer(serializers.ModelSerializer):
    """Section with full snippets - only loaded when section is clicked"""

    snippets = SnippetSerializer(many=True, read_only=True)
    snippets_count = serializers.IntegerField(source="snippets.count", read_only=True)

    class Meta:
        model = Section
        fields = (
            "id",
            "chapter",
            "title",
            "order",
            "is_published",
            "snippets",
            "snippets_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ChapterDetailSerializer(serializers.ModelSerializer):
    """Chapter with minimal sections - sections details loaded on demand"""

    sections = SectionMinimalSerializer(many=True, read_only=True)
    sections_count = serializers.IntegerField(source="sections.count", read_only=True)

    class Meta:
        model = Chapter
        fields = (
            "id",
            "book",
            "title",
            "order",
            "is_published",
            "sections",
            "sections_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class BookDetailSerializer(serializers.ModelSerializer):
    """Book with minimal chapters - chapter details loaded on demand"""

    chapters = ChapterMinimalSerializer(many=True, read_only=True)
    chapters_count = serializers.IntegerField(source="chapters.count", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = Book
        fields = (
            "id",
            "title",
            "description",
            "is_published",
            "created_by",
            "created_by_username",
            "chapters",
            "chapters_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "created_at", "updated_at")


# ==================== LIST SERIALIZERS (for admin/listings) ====================
class BookListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing books"""

    chapters_count = serializers.IntegerField(source="chapters.count", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = Book
        fields = (
            "id",
            "title",
            "description",
            "is_published",
            "created_by_username",
            "chapters_count",
            "created_at",
        )


class ChapterListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chapters"""

    book_title = serializers.CharField(source="book.title", read_only=True)
    sections_count = serializers.IntegerField(source="sections.count", read_only=True)

    class Meta:
        model = Chapter
        fields = (
            "id",
            "book",
            "book_title",
            "title",
            "order",
            "is_published",
            "sections_count",
            "created_at",
        )


class SectionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing sections"""

    chapter_title = serializers.CharField(source="chapter.title", read_only=True)
    snippets_count = serializers.IntegerField(source="snippets.count", read_only=True)

    class Meta:
        model = Section
        fields = (
            "id",
            "chapter",
            "chapter_title",
            "title",
            "order",
            "is_published",
            "snippets_count",
            "created_at",
        )


# ==================== CREATE/UPDATE SERIALIZERS ====================
class BookSerializer(serializers.ModelSerializer):
    """Serializer for book create/update"""

    class Meta:
        model = Book
        fields = (
            "id",
            "title",
            "description",
            "is_published",
            "created_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "created_at", "updated_at")


class ChapterSerializer(serializers.ModelSerializer):
    """Serializer for chapter create/update"""

    class Meta:
        model = Chapter
        fields = (
            "id",
            "book",
            "title",
            "order",
            "is_published",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_order(self, value):
        """Ensure order is positive"""
        if value <= 0:
            raise serializers.ValidationError("Order must be greater than 0")
        return value


class SectionSerializer(serializers.ModelSerializer):
    """Serializer for section create/update"""

    class Meta:
        model = Section
        fields = (
            "id",
            "chapter",
            "title",
            "order",
            "is_published",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_order(self, value):
        """Ensure order is positive"""
        if value <= 0:
            raise serializers.ValidationError("Order must be greater than 0")
        return value