# config/urls.py

from django.contrib import admin
from django.urls import include, path, re_path

from frontend.views import index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    re_path(r"^(?!static/|assets/|api/).*$", index, name="index"),
]
