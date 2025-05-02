import os
from app import app
import routes

print("=" * 50)
print(f"Current working directory: {os.getcwd()}")
print(f"Static folder path: {app.static_folder}")
print(f"Does static folder exist: {os.path.exists(app.static_folder)}")
print("=" * 50)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
