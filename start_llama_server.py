import subprocess
import sys
import os
import argparse

def main():
    parser = argparse.ArgumentParser(description="Boot up llama.cpp server with model")
    parser.add_argument(
        "model_path",
        help="Path to .gguf model file (e.g., ../models/mistral-7b.Q4_K_M.gguf)"
    )
    parser.add_argument(
        "-context", "-c", type=int, default=2048,
        help="Context window size (default: 2048)"
    )
    parser.add_argument(
        "-ngl", type=int, default=0,
        help="Number of layers to offload to GPU via Vulkan (default: 0 = CPU only)"
    )
    parser.add_argument(
        "--port", type=int, default=8080,
        help="Port to launch server on (default: 8080)"
    )
    args = parser.parse_args()

    # Path to server.exe inside build/bin/Release/
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "llama.cpp", "build", "bin", "Release"))
    server_path = os.path.join(base_dir, "llama-server.exe")

    if not os.path.isfile(server_path):
        print(f"❌ Could not find server.exe at: {server_path}")
        sys.exit(1)

    model_path = os.path.abspath(args.model_path)
    if not os.path.isfile(model_path):
        print(f"❌ Model file not found: {model_path}")
        sys.exit(1)

    print(f"🚀 Launching llama.cpp server")
    print(f"📦 Model: {model_path}")
    print(f"🧠 Context size: {args.context}")
    print(f"🎮 Vulkan layers (ngl): {args.ngl}")
    print(f"🌐 Port: {args.port}")

    command = [
        server_path,
        "-m", model_path,
        "-c", str(args.context),
        "--port", str(args.port)
    ]

    if args.ngl > 0:
        command += ["-ngl", str(args.ngl)]

    subprocess.run(command)

if __name__ == "__main__":
    main()
