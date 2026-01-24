# config/urls.py


from django.contrib import admin
from django.urls import path, re_path

from frontend.views import index

urlpatterns = [
    path("admin/", admin.site.urls),
    re_path(r"^(?!static/|assets/).*$", index, name="index"),
]
