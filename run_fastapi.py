#!/usr/bin/env python3
"""
FastAPI Fashion Agent Backend Runner
Run this script from the project root to start the FastAPI backend
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Main function to run the FastAPI backend"""
    
    # Get project root directory
    project_root = Path(__file__).parent.absolute()
    fastapi_dir = project_root / "fastapi_backend"
    venv_path = project_root / "venv"
    
    print("🚀 Starting FastAPI Fashion Agent Backend...")
    print(f"📁 Project root: {project_root}")
    print(f"📁 FastAPI directory: {fastapi_dir}")
    print(f"🐍 Virtual environment: {venv_path}")
    
    # Check if virtual environment exists
    if not venv_path.exists():
        print("❌ Virtual environment not found!")
        print("   Please run the setup script first to create the venv.")
        sys.exit(1)
    
    # Check if FastAPI directory exists
    if not fastapi_dir.exists():
        print("❌ FastAPI backend directory not found!")
        print("   Please ensure fastapi_backend directory exists.")
        sys.exit(1)
    
    # Check if .env file exists in fastapi_backend
    env_file = fastapi_dir / ".env"
    if not env_file.exists():
        print("⚠️  .env file not found in fastapi_backend directory")
        print("   Creating from template...")
        
        env_example = fastapi_dir / "env.example"
        if env_example.exists():
            import shutil
            shutil.copy(env_example, env_file)
            print("📝 Please edit fastapi_backend/.env file with your API keys before running again.")
            print("   Required: GOOGLE_API_KEY and TAVILY_API_KEY")
            sys.exit(1)
        else:
            print("❌ env.example file not found. Please create .env file manually.")
            sys.exit(1)
    
    # Change to FastAPI directory
    os.chdir(fastapi_dir)
    
    # Set up environment
    env = os.environ.copy()
    env["PYTHONPATH"] = str(project_root)
    
    # Activate virtual environment and run FastAPI
    if os.name == 'nt':  # Windows
        activate_script = venv_path / "Scripts" / "activate.bat"
        python_exe = venv_path / "Scripts" / "python.exe"
    else:  # Unix/Linux/macOS
        activate_script = venv_path / "bin" / "activate"
        python_exe = venv_path / "bin" / "python"
    
    if not python_exe.exists():
        print(f"❌ Python executable not found at {python_exe}")
        sys.exit(1)
    
    print("🌟 Starting FastAPI server...")
    print("📚 API Documentation will be available at: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Run uvicorn with the virtual environment's Python
        subprocess.run([
            str(python_exe), "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], env=env, cwd=fastapi_dir)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
