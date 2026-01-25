# snippets/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    Admin: Full CRUD access
    User: Read-only access to published content
    """

    def has_permission(self, request, view):
        # Read permissions for authenticated users
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions only for admins
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )

    def has_object_permission(self, request, view, obj):
        # Read permissions for published content
        if request.method in SAFE_METHODS:
            # Users can only see published content
            if request.user.role == "user":
                return obj.is_published
            # Admins can see everything
            return True

        # Write permissions only for admins
        return request.user.role == "admin"
