# frontend/views.py

import os

from django.conf import settings
from django.http import HttpResponse


def index(request, *args, **kwargs):
    index_path = os.path.join(settings.STATIC_ROOT, "index.html")

    try:
        with open(index_path) as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse(
            """
            <h1>No build</h1>
            """,
            status=503,
        )
