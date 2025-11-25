#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-drawing-canvas-177475-177485/drawing_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

