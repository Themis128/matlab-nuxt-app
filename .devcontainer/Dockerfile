FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install common tooling and Node.js (LTS) + Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg lsb-release git build-essential procps apt-transport-https apt-utils \
    python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install Node 18 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

# Create non-root vscode user (devcontainers default uses vscode)
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    apt-get update && apt-get install -y sudo && \
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME && \
    chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME
WORKDIR /workspace

# Keep node and python packages quick to install for dev
COPY --chown=vscode:vscode . /workspace

# default: install Python and Node deps later via postCreateCommand
RUN mkdir -p /home/vscode/.local/bin

ENV PATH="/home/vscode/.local/bin:${PATH}"

RUN sudo chmod +x /workspace/.devcontainer/post-create.sh || true

CMD ["sleep","infinity"]
