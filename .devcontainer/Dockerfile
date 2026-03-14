FROM node:22-bookworm-slim

# System tools useful for dev work
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    jq \
    tmux \
    sudo \
 && echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node \
 && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# The node:22 image already has a 'node' user at UID/GID 1000
USER node
WORKDIR /workspace
