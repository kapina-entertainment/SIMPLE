import urllib.request
import urllib.parse
import json
import os
import zipfile
import io
import mimetypes

folder_to_deploy = r'c:\Users\kapin\Workspace\Antigravity'
api_url = 'https://api.netlify.com/api/v1/sites'

# We'll use a public deploy drop to Netlify API without auth if possible, or just build an ngrok/localtunnel.
# Actually, the simplest way for a user without Node is to upload the ZIP.
# Let's create a ZIP file on their Desktop so they can just drag and drop it into Netlify Drop.
desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')
zip_path = os.path.join(desktop, 'Simple_Portfolio.zip')

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            if not file.endswith('.zip') and not '.git' in root and not 'node_modules' in root:
                file_path = os.path.join(root, file)
                ziph.write(file_path, os.path.relpath(file_path, path))

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir(folder_to_deploy, zipf)

print(f'Successfully created ZIP file at: {zip_path}')
