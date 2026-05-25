import sys, os
# Ensure project root is in sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from app import create_app
from models.models import Teacher

app = create_app()
with app.app_context():
    count = Teacher.query.count()
    print('Teacher count:', count)
