# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec for Student Personal Dashboard backend.
Packages the FastAPI backend as a standalone Windows executable.
"""
import os
import sys

block_cipher = None

# Collect all backend source files
backend_dir = os.path.abspath('.')

# All Python files in the backend
datas = []
# Include any .json, .sql, or config files if they exist
for ext in ['*.json', '*.sql', '*.yaml', '*.yml']:
    import glob
    for f in glob.glob(os.path.join(backend_dir, ext)):
        datas.append((f, '.'))

# Hidden imports needed by FastAPI/SQLAlchemy/Uvicorn
hidden_imports = [
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.http.h11_impl',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    'uvicorn.lifespan.off',
    'sqlalchemy.dialects.sqlite',
    'sqlalchemy.sql.default_comparator',
    # Backend modules
    'database',
    'models',
    'models.activity',
    'models.communication',
    'models.daily_record',
    'models.diary',
    'models.dsa_entry',
    'models.growth',
    'models.planning',
    'models.settings',
    'models.task',
    'routes',
    'routes.daily',
    'routes.analytics',
    'routes.activities',
    'routes.tasks',
    'routes.diary',
    'routes.dsa',
    'routes.communication',
    'routes.growth',
    'routes.planning',
    'routes.settings',
    'routes.search',
    'routes.export',
    'routes.admin',
    'schemas',
    'schemas.analytics',
    'schemas.daily',
    'schemas.settings',
    'schemas.trackers',
    'services',
    'services.analytics_service',
    'services.daily_service',
    'services.date_service',
    'services.export_service',
    'services.scoring_service',
    'services.search_service',
]

a = Analysis(
    ['main.py'],
    pathex=[backend_dir],
    binaries=[],
    datas=datas,
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter', 'matplotlib', 'PIL', 'numpy', 'scipy',
        'pytest', 'test', '_pytest',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='student-dashboard-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Need console for uvicorn output
    disable_windowed_traceback=False,
    argv_emulation=False,
    icon=os.path.join('..', 'Premium Productivity Application', 'electron', 'icon.ico'),
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='student-dashboard-backend',
)
